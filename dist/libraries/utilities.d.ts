import { JsonRpcProxy } from "../classes/JsonRpcProxy";
import { WebApp } from "../classes/WebApp";
import { cmdComposedCommand as __cmd } from "./cmd";
import { cascade as cascadeEnv } from "./environment";
import { httpRequest, jsonRpcRequest } from "./http";
import { parseStringArray as __parseIns } from "./stringUtil";
declare const sys: {
    JsonRpcProxy: typeof JsonRpcProxy;
    WebApp: typeof WebApp;
    cascadeEnv: typeof cascadeEnv;
    httpRequest: typeof httpRequest;
    jsonRpcRequest: typeof jsonRpcRequest;
    print: (...args: any[]) => void;
    prompt: any;
};
export { __cmd, __parseIns, sys };
