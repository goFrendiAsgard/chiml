import { exec } from "child_process";
import { copy as fsCopy, readdir as readDir, readFile, stat as fsStat, writeFile } from "fs-extra";
import { basename as pathBaseName, dirname as pathDirName, resolve as pathResolve } from "path";
import { SingleTask } from "../classes/SingleTask";
import { tsToJs } from "./scriptTransform";
import { chimlToConfig, doubleQuote, parseStringArray, removeFlank } from "./stringUtil";

const rootDirPath = pathDirName(pathDirName(__dirname));
const distPath = pathResolve(rootDirPath, "dist");
const srcPath = pathResolve(rootDirPath, "src");
const packageJsonPath = pathResolve(rootDirPath, "package.json");
const nodeModulePath = pathResolve(rootDirPath, "node_modules");

export function execute(...args: any[]): Promise<any> {
    const chiml = args[0];
    const ins = parseStringArray(args.slice(1));
    return new Promise((resolve, reject) => {
        chimlToConfig(chiml)
            .then((config) => {
                const task = new SingleTask(config);
                task.execute(...ins)
                    .then(resolve)
                    .catch(reject);
            })
            .catch(reject);
    });
}

export function getCompiledScript(chiml: any): Promise<string> {
    return new Promise((resolve, reject) => {
        chimlToConfig(chiml)
            .then((config) => {
                const task = new SingleTask(config);
                const mainScript = task.getScript();
                const script = [
                    'import {__cmd, __parseIns, sys} from "chiml/dist/index.js";',
                    "const __isCompiled = true;",
                    mainScript,
                    "module.exports = __main_0;",
                    "if (require.main === module) {",
                    "  const args = __parseIns(process.argv.slice(2));",
                    "  __main_0(...args).then(",
                    "    (result) => {",
                    '      const shownResult = Array.isArray(result) || typeof result === "object" ?',
                    "        JSON.stringify(result, null, 2) : result;",
                    "      console.log(shownResult);",
                    "    }",
                    "  ).catch(",
                    "    (error) => console.error(error)",
                    "  );",
                    "}",
                ].join("\n");
                resolve(tsToJs(script));
            })
            .catch(reject);
    });
}

export function compile(chimlFiles: string[]): Promise<any> {
    chimlFiles = chimlFiles.filter((fileName) => fileName.match(/^(.*)\.chiml/gmi));
    let jsFilePathList = [];
    const parentDirs = chimlFiles.map((filePath) => pathDirName(filePath));
    const uniqueParentDirs = [...new Set(parentDirs)].filter((dirPath) => dirPath !== rootDirPath);
    const compilator = chimlFiles.map((chiml) => compileSingleFile(chiml));
    const nodeModuleCreator = uniqueParentDirs.map((dirPath) => createSingleNodeModule(dirPath));
    return Promise.all(compilator)
        .then((result) => {
            jsFilePathList = result;
        })
        .then(() => {
            return Promise.all(nodeModuleCreator);
        })
        .then(() => {
            return Promise.resolve(jsFilePathList);
        });
}

export async function getFiles(dir: string): Promise<any> {
    try {
        const subdirs = await readDir(dir);
        const files = await Promise.all(subdirs.map(async (subdir) => {
            const res = pathResolve(dir, subdir);
            return (await fsStat(res)).isDirectory() ? getFiles(res) : res;
        }));
        return files.reduce((a, f) => a.concat(f), []);
    } catch (error) {
        return Promise.reject(error);
    }
}

function createSingleNodeModule(targetDirPath: string): Promise<any> {
    const newNodeModulePath = pathResolve(targetDirPath, "node_modules");
    const newDistPath = pathResolve(targetDirPath, "node_modules", "chiml", "dist");
    const newSrcPath = pathResolve(targetDirPath, "node_modules", "chiml", "src");
    const newPackageJsonPath = pathResolve(targetDirPath, "node_modules", "chiml", "package.json");
    const options = { dereference: true };
    return fsCopy(packageJsonPath, newPackageJsonPath, options)
        .then(() => {
            return copyMultiDirs([
                [distPath, newDistPath],
                [srcPath, newSrcPath],
                [nodeModulePath, newNodeModulePath],
            ], options);
        });
}

export function copyMultiDirs(configs: string[][], options: { [key: string]: any } = {}): Promise<any> {
    const commandList = configs.map((config) => {
        const source = config[0];
        const destination = config[1];
        return createCopyCommand(source, destination);
    });
    const command = commandList.join(" && ");
    // Promise: try to execute the command. If failed, fallback to fsCopy
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                // fallback to fsCopy
                const promises = configs.map((config) => fsCopy(config[0], config[1], options));
                return Promise.all(promises)
                    .then(resolve)
                    .catch(reject);
            }
            resolve(true);
        });
    });
}

function createCopyCommand(source: string, destination: string): string {
    const quotedSource = doubleQuote(source + "/.");
    const quotedDestination = doubleQuote(destination);
    return `cp -r ${quotedSource} ${quotedDestination}`;
}

function compileSingleFile(chiml: string): Promise<any> {
    const targetDirPath = pathDirName(chiml);
    const targetFileName = pathBaseName(chiml);
    const jsFileName = targetFileName.replace(/^(.*)\.chiml$/gmi, "$1.js");
    const jsFilePath = pathResolve(targetDirPath, jsFileName);
    return readFile(chiml)
        .then(() => {
            return getCompiledScript(chiml);
        })
        .then((compiledScript) => {
            return writeFile(jsFilePath, compiledScript);
        })
        .then(() => {
            return Promise.resolve(jsFilePath);
        });
}
