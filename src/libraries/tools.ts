import {copy as fsCopy, writeFile} from "fs-extra";
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
        'import {__cmd, __parseIns} from "./.chiml/libraries/utilities.js";',
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
  const chimlDirPath = pathDirName(chiml);
  const chimlFileName = pathBaseName(chiml);
  const jsFileName = chimlFileName.replace(".chiml", ".js");
  const jsFilePath = pathResolve(chimlDirPath, jsFileName);
  const distDstPath = pathResolve(pathDirName(chiml), ".chiml");
  const distSrcPath = pathResolve(pathDirName(pathDirName(__dirname)), "dist");
  return getCompiledScript(chiml).then((compiledScript) => {
    return writeFile(jsFilePath, compiledScript);
  }).then(() => {
    return fsCopy(distSrcPath, distDstPath);
  });
}
