import { WebApp } from "../classes/WebApp";
import { cmdComposedCommand as __cmd } from "./cmd";
import { httpRequest, jsonRpcRequest } from "./http";
import { parseStringArray as __parseIns } from "./stringUtil";
declare const sys: {
    WebApp: typeof WebApp;
    httpRequest: typeof httpRequest;
    jsonRpcRequest: typeof jsonRpcRequest;
};
export { __cmd, __parseIns, sys };
