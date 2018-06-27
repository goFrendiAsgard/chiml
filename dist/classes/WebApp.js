"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const Koa = require("koa");
const koaRoute = require("koa-route");
const httpMethods = require("methods");
const middlewares_1 = require("../libraries/middlewares");
const defaultPageConfig = {
    controller: (...ins) => ins.slice(0, -1).join(""),
    method: "all",
    outProcessor: middlewares_1.defaultOutProcessor,
    propagateCtx: false,
    url: "/",
};
class WebApp extends Koa {
    constructor() {
        super(...arguments);
        this.createServer = this.createHttpServer;
    }
    createHttpServer() {
        return http.createServer(this.callback());
    }
    createHttpsServer(options = {}) {
        return https.createServer(options, this.callback());
    }
    addJsonRpcMiddleware(url, configs) {
        const normalizedConfigs = configs.map((config) => {
            return Object.assign({ method: null, propagateCtx: false, controller: (...ins) => ins }, config);
        });
        const jsonRpcMiddleware = middlewares_1.createJsonRpcMiddleware(normalizedConfigs);
        for (const httpMethod of httpMethods) {
            this.use(koaRoute[httpMethod](url, jsonRpcMiddleware));
        }
    }
    addMiddlewares(configs) {
        for (const config of configs) {
            this.addMiddleware(config);
        }
    }
    addRoutes(configs) {
        for (const config of configs) {
            this.addRoute(config);
        }
    }
    addMiddleware(config) {
        this.use(middlewares_1.createMiddleware(config));
    }
    addRoute(config) {
        const { method, url, controller, propagateCtx, outProcessor } = Object.assign({}, defaultPageConfig, config);
        const middleware = middlewares_1.createMiddleware(controller, propagateCtx, outProcessor);
        this.use(koaRoute[method](url, middleware));
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=WebApp.js.map