"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "../package.json" }).start();
const WebApp_1 = require("../classes/WebApp");
const cmd_1 = require("./cmd");
exports.__cmd = cmd_1.cmdComposedCommand;
const http_1 = require("./http");
const inputOutput_1 = require("./inputOutput");
const stringUtil_1 = require("./stringUtil");
exports.__parseIns = stringUtil_1.parseStringArray;
const sys = {
    WebApp: WebApp_1.WebApp,
    httpRequest: http_1.httpRequest,
    jsonRpcRequest: http_1.jsonRpcRequest,
    print: inputOutput_1.print,
    prompt: inputOutput_1.createPrompt(),
};
exports.sys = sys;
//# sourceMappingURL=utilities.js.map