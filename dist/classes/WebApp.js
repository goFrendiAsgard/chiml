"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const Koa = require("koa");
const koaRoute = require("koa-route");
const tools_1 = require("../libraries/tools");
function defaultOutProcessor(ctx, out) {
    ctx.body = (ctx.body || "") + String(out);
}
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
    addPage(method, url, config, outProcessor = defaultOutProcessor) {
        const middleware = this.createPageMiddleware(config, outProcessor);
        this.use(koaRoute[method](url, middleware));
    }
    createPageMiddleware(config, outProcessor) {
        if (typeof config === "string") {
            return (ctx, ...ins) => {
                return tools_1.execute(config, ...ins).then((out) => {
                    outProcessor(ctx, out);
                });
            };
        }
        return (ctx, ...ins) => {
            const out = config(...ins);
            outProcessor(ctx, out);
        };
    }
    createMiddleware(config) {
        if (typeof config === "string") {
            return (...ins) => {
                return tools_1.execute(config, ...ins);
            };
        }
        return config;
    }
}
exports.WebApp = WebApp;
//# sourceMappingURL=WebApp.js.map