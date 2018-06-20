import {copy as fsCopy, readFile, writeFile} from "fs-extra";
import {basename as pathBaseName, dirname as pathDirName, resolve as pathResolve} from "path";
import {SingleTask} from "../classes/SingleTask";
import {tsToJs} from "./scriptTransform";
import {chimlToConfig, parseStringArray} from "./stringUtil";

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
      resolve(tsToJs(script));
    }).catch(reject);
  });
}

export function compileChimlFile(chiml: any): Promise<any> {
  const rootDirPath = pathDirName(pathDirName(__dirname));
  const targetDirPath = pathDirName(chiml);
  const targetFileName = pathBaseName(chiml);
  const jsFileName = targetFileName.replace(/^(.*)\.chiml/gmi, "$1.js");
  const jsFilePath = pathResolve(targetDirPath, jsFileName);
  const nodeModuleDstPath = pathResolve(targetDirPath, "node_modules");
  const nodeModuleSrcPath = pathResolve(rootDirPath, "node_modules");
  const distDstPath = pathResolve(targetDirPath, "node_modules", "chiml", "dist");
  const distSrcPath = pathResolve(rootDirPath, "dist");
  const srcDstPath = pathResolve(targetDirPath, "node_modules", "chiml", "src");
  const srcSrcPath = pathResolve(rootDirPath, "src");
  const pkgDstPath = pathResolve(targetDirPath, "node_modules", "chiml", "package.json");
  const pkgSrcPath = pathResolve(rootDirPath, "package.json");
  return readFile(chiml).then(() => {
    return getCompiledScript(chiml);
  }).then((compiledScript) => {
    return writeFile(jsFilePath, compiledScript);
  }).then(() => {
    return fsCopy(srcSrcPath, srcDstPath);
  }).then(() => {
    return Promise.all([
      fsCopy(distSrcPath, distDstPath),
      fsCopy(nodeModuleSrcPath, nodeModuleDstPath),
      fsCopy(pkgSrcPath, pkgDstPath),
    ]);
  }).then(() => {
    return Promise.resolve(jsFilePath);
  });
}
