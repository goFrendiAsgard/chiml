"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const Koa = require("koa");
const middlewares_1 = require("../libraries/middlewares");
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
    }
    addAuthenticationMiddleware(config) {
        this.use(middlewares_1.createAuthenticationMiddleware(config));
    }
    addAuthorizationMiddleware(config) {
        this.use(middlewares_1.createAuthorizationMiddleware(config));
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
        this.use(middlewares_1.createMiddleware(controller));
    }
    addRoute(config) {
        this.use(middlewares_1.createRouteMiddleware(config));
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=WebApp.js.map