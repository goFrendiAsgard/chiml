"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const Koa = require("koa");
const middlewares_1 = require("../libraries/middlewares");
const defaultRouteConfig = {
    method: "all",
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
        this.use(middlewares_1.createJsonRpcMiddleware(url, configs));
        /*
        const normalizedConfigs = configs.map((config) => {
          return Object.assign({method: "all", propagateCtx: false, controller: (...ins) => ins}, config);
        });
        const jsonRpcMiddleware = createJsonRpcMiddleware(normalizedConfigs);
        for (const httpMethod of httpMethods) {
          this.use(koaRoute[httpMethod](url, jsonRpcMiddleware));
        }
        */
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
    addMiddleware(controller) {
        this.use(middlewares_1.createMiddleware({ controller }));
    }
    addRoute(config) {
        this.use(middlewares_1.createRouteMiddleware(config));
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=WebApp.js.map