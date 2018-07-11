"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const originalHttpRequest = require("request");
function httpRequest(config, callback) {
    originalHttpRequest(config, (error, response, body) => {
        callback(error, body);
    });
}
exports.httpRequest = httpRequest;
function jsonRpcRequest(url, method, ...params) {
    const callback = params.pop();
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method,
            params,
        }),
        method: "POST",
        url,
    };
    httpRequest(requestConfig, (error, body) => {
        if (error) {
            return callback(error, null);
        }
        try {
            const obj = JSON.parse(body);
            if ("result" in obj) {
                return callback(null, obj.result);
            }
            return callback(obj.error, null);
        }
        catch (error) {
            return callback(error, null);
        }
    });
}
exports.jsonRpcRequest = jsonRpcRequest;
//# sourceMappingURL=http.js.map