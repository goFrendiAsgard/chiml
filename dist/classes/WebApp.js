"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const Koa = require("koa");
const middlewares_1 = require("../libraries/middlewares");
class WebApp extends Koa {
    constructor() {
        super();
        this.createServer = this.createHttpServer;
        this.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
            this.ctx = ctx;
            yield next();
        }));
    }
    createHttpServer() {
        return http.createServer(this.callback());
    }
    createHttpsServer(options = {}) {
        return https.createServer(options, this.callback());
    }
    addJsonRpc(url, configs) {
        this.use(middlewares_1.createJsonRpcMiddleware(url, configs));
    }
    addAuthentication(config) {
        this.use(middlewares_1.createAuthenticationMiddleware(config));
    }
    addAuthorization(config) {
        this.use(middlewares_1.createAuthorizationMiddleware(config));
    }
    addMiddlewares(controllers) {
        for (const controller of controllers) {
            this.addMiddleware(controller);
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