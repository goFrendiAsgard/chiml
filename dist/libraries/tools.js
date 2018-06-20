"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const SingleTask_1 = require("../classes/SingleTask");
const scriptTransform_1 = require("./scriptTransform");
const stringUtil_1 = require("./stringUtil");
const rootDirPath = path_1.dirname(path_1.dirname(__dirname));
const distPath = path_1.resolve(rootDirPath, "dist");
const srcPath = path_1.resolve(rootDirPath, "src");
const packageJsonPath = path_1.resolve(rootDirPath, "package.json");
function execute(...args) {
    const chiml = args[0];
    const ins = stringUtil_1.parseStringArray(args.slice(1));
    return new Promise((resolve, reject) => {
        stringUtil_1.chimlToConfig(chiml).then((config) => {
            const task = new SingleTask_1.SingleTask(config);
            task.execute(...ins).then(resolve).catch(reject);
        }).catch(reject);
    });
}
exports.execute = execute;
function getCompiledScript(chiml) {
    return new Promise((resolve, reject) => {
        stringUtil_1.chimlToConfig(chiml).then((config) => {
            const task = new SingleTask_1.SingleTask(config);
            const mainScript = task.getScript();
            const script = [
                'import {__cmd, __parseIns} from "chiml/dist/libraries/utilities.js";',
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
            resolve(scriptTransform_1.tsToJs(script));
        }).catch(reject);
    });
}
exports.getCompiledScript = getCompiledScript;
function compile(chimlFiles) {
    let jsFilePathList = [];
    const parentDirs = chimlFiles.map((filePath) => path_1.dirname(filePath));
    const uniqueParentDirs = [...new Set(parentDirs)];
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
exports.compile = compile;
function getFiles(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const subdirs = yield fs_extra_1.readdir(dir);
            const files = yield Promise.all(subdirs.map((subdir) => __awaiter(this, void 0, void 0, function* () {
                const res = path_1.resolve(dir, subdir);
                return (yield fs_extra_1.stat(res)).isDirectory() ? getFiles(res) : res;
            })));
            return files.reduce((a, f) => a.concat(f), []);
        }
        catch (error) {
            return error;
        }
    });
}
exports.getFiles = getFiles;
function createSingleNodeModule(targetDirPath) {
    const nodeModuleDstPath = path_1.resolve(targetDirPath, "node_modules");
    const nodeModuleSrcPath = path_1.resolve(rootDirPath, "node_modules");
    const newDistPath = path_1.resolve(targetDirPath, "node_modules", "chiml", "dist");
    const newSrcPath = path_1.resolve(targetDirPath, "node_modules", "chiml", "src");
    const newPackageJsonPath = path_1.resolve(targetDirPath, "node_modules", "chiml", "package.json");
    return fs_extra_1.copy(srcPath, newSrcPath).then(() => {
        return Promise.all([
            fs_extra_1.copy(distPath, newDistPath),
            fs_extra_1.copy(nodeModuleSrcPath, nodeModuleDstPath),
            fs_extra_1.copy(packageJsonPath, newPackageJsonPath),
        ]);
    }).then(() => {
        return Promise.resolve(true);
    });
}
function compileSingleFile(chiml) {
    const targetDirPath = path_1.dirname(chiml);
    const targetFileName = path_1.basename(chiml);
    const jsFileName = targetFileName.replace(/^(.*)\.chiml/gmi, "$1.js");
    const jsFilePath = path_1.resolve(targetDirPath, jsFileName);
    if (jsFileName === chiml) {
        return Promise.reject(new Error(`${chiml} should has chiml extension`));
    }
    return fs_extra_1.readFile(chiml).then(() => {
        return getCompiledScript(chiml);
    }).then((compiledScript) => {
        return fs_extra_1.writeFile(jsFilePath, compiledScript);
    }).then(() => {
        return Promise.resolve(jsFilePath);
    });
}
//# sourceMappingURL=tools.js.map