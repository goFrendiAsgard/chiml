"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonRpcProxy_1 = require("../classes/JsonRpcProxy");
const WebApp_1 = require("../classes/WebApp");
const cmd_1 = require("./cmd");
exports.__cmd = cmd_1.cmdComposedCommand;
const environment_1 = require("./environment");
const http_1 = require("./http");
const inputOutput_1 = require("./inputOutput");
const stringUtil_1 = require("./stringUtil");
exports.__parseIns = stringUtil_1.parseStringArray;
const sys = {
    JsonRpcProxy: JsonRpcProxy_1.JsonRpcProxy,
    WebApp: WebApp_1.WebApp,
    cascadeEnv: environment_1.cascade,
    httpRequest: http_1.httpRequest,
    jsonRpcRequest: http_1.jsonRpcRequest,
    print: inputOutput_1.createPrint(),
    prompt: inputOutput_1.createPrompt(),
};
exports.sys = sys;
