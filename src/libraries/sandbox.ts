import {dirname as pathDirName, resolve as pathResolve} from "path";
import * as utilities from "../libraries/utilities";

export function createSandbox(chimlPath): {[key: string]: any} {
  const validChimlPath = chimlPath.match(/^(.*)\.chiml/gmi);
  const fileName = validChimlPath ? chimlPath : pathResolve(process.cwd(), "virtual");
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
