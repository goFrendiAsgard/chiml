"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonRpcProxy_1 = require("../classes/JsonRpcProxy");
function createJsonRpcProxy(config) {
    return new JsonRpcProxy_1.JsonRpcProxy(config);
}
exports.createJsonRpcProxy = createJsonRpcProxy;
