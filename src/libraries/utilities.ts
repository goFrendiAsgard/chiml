import { JsonRpcProxy } from "../classes/JsonRpcProxy";
import { WebApp } from "../classes/WebApp";
import { cmdComposedCommand as __cmd } from "./cmd";
import { cascade as cascadeEnv } from "./environment";
import { httpRequest, jsonRpcRequest } from "./http";
import { createPrint, createPrompt } from "./inputOutput";
import { parseStringArray as __parseIns } from "./stringUtil";

const sys = {
    JsonRpcProxy,
    WebApp,
    cascadeEnv,
    httpRequest,
    jsonRpcRequest,
    print: createPrint(),
    prompt: createPrompt(),
};

export { __cmd, __parseIns, sys };
