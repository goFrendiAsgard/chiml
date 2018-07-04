import * as cacheRequirePaths from "cache-require-paths";
import {WebApp} from "../classes/WebApp";
import {cmdComposedCommand as __cmd} from "./cmd";
import {httpRequest, jsonRpcRequest} from "./http";
import {print, prompt} from "./inputOutput";
import {parseStringArray as __parseIns} from "./stringUtil";

const sys = {
  WebApp,
  httpRequest,
  jsonRpcRequest,
  print,
  prompt,
};

export {__cmd, __parseIns, sys};
