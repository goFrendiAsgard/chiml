import {dirname as pathDirName, resolve as pathResolve} from "path";
import * as utilities from "../libraries/utilities";

export function createSandbox(chimlPath: string): {[key: string]: any} {
  const validChimlPath = String(chimlPath).match(/^(.*)\.chiml/gmi);
  const fileName = validChimlPath ? pathResolve(chimlPath) : pathResolve(process.cwd(), "virtual");
  const dirName = pathDirName(fileName);
  const sandbox: {[key: string]: any} = Object.assign({
    __dirname: dirName,
    __fileName: fileName,
    __isCompiled: false,
    console,
    require,
  }, utilities);
  return sandbox;
}
