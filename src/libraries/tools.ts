import * as cacheRequirePaths from "cache-require-paths";
import {copy as fsCopy, readdir as readDir, readFile, stat as fsStat, writeFile} from "fs-extra";
import {basename as pathBaseName, dirname as pathDirName, resolve as pathResolve} from "path";
import {SingleTask} from "../classes/SingleTask";
import {tsToJs} from "./scriptTransform";
import {chimlToConfig, parseStringArray} from "./stringUtil";

const rootDirPath = pathDirName(pathDirName(__dirname));
const distPath = pathResolve(rootDirPath, "dist");
const srcPath = pathResolve(rootDirPath, "src");
const packageJsonPath = pathResolve(rootDirPath, "package.json");
const nodeModulePath = pathResolve(rootDirPath, "node_modules");

export function execute(...args: any[]): Promise<any> {
  const chiml = args[0];
  const ins = parseStringArray(args.slice(1));
  return new Promise((resolve, reject) => {
    chimlToConfig(chiml).then((config) => {
      const task = new SingleTask(config);
      task.execute(...ins).then(resolve).catch(reject);
    }).catch(reject);
  });
}

export function getCompiledScript(chiml: any): Promise<string> {
  return new Promise((resolve, reject) => {
    chimlToConfig(chiml).then((config) => {
      const task = new SingleTask(config);
      const mainScript = task.getScript();
      const script = [
        'import * as cacheRequirePaths from "cache-require-paths";',
        'import {__cmd, __parseIns} from "chiml/dist/libraries/utilities.js";',
        "const __isCompiled = true;",
        mainScript,
        "module.exports = __main_0;",
        "if (require.main === module) {",
        "  const args = __parseIns(process.argv.slice(2));",
        "  __main_0(...args).then(",
        "    (result) => console.log(result)",
        "  ).catch(",
        "    (error) => console.error(error)",
        "  );",
        "}",
      ].join("\n");
      resolve(tsToJs(script));
    }).catch(reject);
  });
}

export function compile(chimlFiles: string[]): Promise<any> {
  chimlFiles = chimlFiles.filter((fileName) => fileName.match(/^(.*)\.chiml/gmi));
  let jsFilePathList = [];
  const parentDirs = chimlFiles.map((filePath) => pathDirName(filePath));
  const uniqueParentDirs = [...new Set(parentDirs)].filter((dirPath) => dirPath !== rootDirPath);
  const compilator = chimlFiles.map((chiml) => compileSingleFile(chiml));
  const nodeModuleCreator = uniqueParentDirs.map((dirPath) => createSingleNodeModule(dirPath));
  return Promise.all(compilator).then((result) => {
    jsFilePathList = result;
  }).then(() => {
    return Promise.all(nodeModuleCreator);
  }).then(() => {
    return Promise.resolve(jsFilePathList);
  });
}

export async function getFiles(dir): Promise<any> {
  try {
    const subdirs = await readDir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
      const res = pathResolve(dir, subdir);
      return (await fsStat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
  } catch (error) {
    return error;
  }
}

function createSingleNodeModule(targetDirPath): Promise<any> {
  const newNodeModulePath = pathResolve(targetDirPath, "node_modules");
  const newDistPath = pathResolve(targetDirPath, "node_modules", "chiml", "dist");
  const newSrcPath = pathResolve(targetDirPath, "node_modules", "chiml", "src");
  const newPackageJsonPath = pathResolve(targetDirPath, "node_modules", "chiml", "package.json");
  const options = {dereference: true};
  return fsCopy(packageJsonPath, newPackageJsonPath, options).then(() => {
    return Promise.all([
      fsCopy(distPath, newDistPath, options),
      fsCopy(srcPath, newSrcPath, options),
      fsCopy(nodeModulePath, newNodeModulePath, options),
    ]).then(() => Promise.resolve(true));
  });
}

function compileSingleFile(chiml: string): Promise<any> {
  const targetDirPath = pathDirName(chiml);
  const targetFileName = pathBaseName(chiml);
  const jsFileName = targetFileName.replace(/^(.*)\.chiml$/gmi, "$1.js");
  const jsFilePath = pathResolve(targetDirPath, jsFileName);
  return readFile(chiml).then(() => {
    return getCompiledScript(chiml);
  }).then((compiledScript) => {
    return writeFile(jsFilePath, compiledScript);
  }).then(() => {
    return Promise.resolve(jsFilePath);
  });
}
