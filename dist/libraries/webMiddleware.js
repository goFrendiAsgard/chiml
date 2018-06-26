"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koaRoute = require("koa-route");
function jsonRpc(path) {
    return koaRoute.post(`${path}/:procedure`, (ctx, procedure) => {
        // TODO: map a json rpc response
        ctx.body = JSON.stringify({});
    });
}
exports.jsonRpc = jsonRpc;
function xmlRpc(path) {
    return koaRoute.post(`${path}/:procedure`, (ctx, procedure) => {
        // TODO: map a xml rpc response
        ctx.body = JSON.stringify({});
    });
}
exports.xmlRpc = xmlRpc;
//# sourceMappingURL=webMiddleware.js.map