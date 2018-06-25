"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const Koa = require("koa");
const koaRoute = require("koa-route");
const tools_1 = require("../libraries/tools");
class WebApp extends Koa {
    createServer() {
        return http_1.createServer(this.callback());
    }
    addMiddleware(config) {
        this.use(this.createMiddleware(config));
    }
    addRoute(method, url, config) {
        const middleware = this.createMiddleware(config);
        this.use(koaRoute[method](url, middleware));
    }
    createMiddleware(config) {
        if (typeof config === "string") {
            return (...ins) => {
                const promise = tools_1.execute(config, ...ins);
                console.log([config, promise]);
                return promise;
            };
        }
        return config;
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=WebApp.js.map