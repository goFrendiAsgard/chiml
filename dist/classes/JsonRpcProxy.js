"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("../libraries/http");
class JsonRpcProxy {
    constructor(url) {
        this.url = url;
    }
    call(method, ...params) {
        http_1.jsonRpcRequest(this.url, method, ...params);
    }
}
exports.JsonRpcProxy = JsonRpcProxy;
//# sourceMappingURL=JsonRpcProxy.js.map