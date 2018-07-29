import { WebApp } from "../classes/WebApp";
import { cmdComposedCommand as __cmd } from "./cmd";
import { cascade as cascadeEnv } from "./environment";
import { httpRequest, jsonRpcRequest } from "./http";
import { print } from "./inputOutput";
import { parseStringArray as __parseIns } from "./stringUtil";
declare const sys: {
    WebApp: typeof WebApp;
    cascadeEnv: typeof cascadeEnv;
    httpRequest: typeof httpRequest;
    jsonRpcRequest: typeof jsonRpcRequest;
    print: typeof print;
    prompt: any;
};
export { __cmd, __parseIns, sys };
