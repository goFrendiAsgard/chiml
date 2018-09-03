"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cache-require-paths");
const http_1 = require("../libraries/http");
class JsonRpcProxy {
    constructor(config) {
        this.config = config;
    }
    call(method, ...params) {
        http_1.jsonRpcRequest(this.config, method, ...params);
    }
}
exports.JsonRpcProxy = JsonRpcProxy;
//# sourceMappingURL=JsonRpcProxy.js.map