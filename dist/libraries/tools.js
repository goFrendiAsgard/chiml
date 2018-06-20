"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const SingleTask_1 = require("../classes/SingleTask");
const scriptTransform_1 = require("./scriptTransform");
const stringUtil_1 = require("./stringUtil");
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
function compileChimlFile(chiml) {
    const rootDirPath = path_1.dirname(path_1.dirname(__dirname));
    const targetDirPath = path_1.dirname(chiml);
    const targetFileName = path_1.basename(chiml);
    const jsFileName = targetFileName.replace(/^(.*)\.chiml/gmi, "$1.js");
    const jsFilePath = path_1.resolve(targetDirPath, jsFileName);
    const nodeModuleDstPath = path_1.resolve(targetDirPath, "node_modules");
    const nodeModuleSrcPath = path_1.resolve(rootDirPath, "node_modules");
    const distDstPath = path_1.resolve(targetDirPath, "node_modules", "chiml", "dist");
    const distSrcPath = path_1.resolve(rootDirPath, "dist");
    const srcDstPath = path_1.resolve(targetDirPath, "node_modules", "chiml", "src");
    const srcSrcPath = path_1.resolve(rootDirPath, "src");
    const pkgDstPath = path_1.resolve(targetDirPath, "node_modules", "chiml", "package.json");
    const pkgSrcPath = path_1.resolve(rootDirPath, "package.json");
    return fs_extra_1.readFile(chiml).then(() => {
        return getCompiledScript(chiml);
    }).then((compiledScript) => {
        return fs_extra_1.writeFile(jsFilePath, compiledScript);
    }).then(() => {
        return fs_extra_1.copy(srcSrcPath, srcDstPath);
    }).then(() => {
        return Promise.all([
            fs_extra_1.copy(distSrcPath, distDstPath),
            fs_extra_1.copy(nodeModuleSrcPath, nodeModuleDstPath),
            fs_extra_1.copy(pkgSrcPath, pkgDstPath),
        ]);
    }).then(() => {
        return Promise.resolve(jsFilePath);
    });
}
exports.compileChimlFile = compileChimlFile;
//# sourceMappingURL=tools.js.map