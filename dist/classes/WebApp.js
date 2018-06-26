"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
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
    addPage(method, url, config, outProcessor = defaultOutProcessor) {
        const middleware = this.createPageMiddleware(config, outProcessor);
        this.use(koaRoute[method](url, middleware));
    }
    createPageMiddleware(config, outProcessor) {
        const middleware = this.createMiddleware(config);
        return (ctx, ...ins) => {
            return middleware(...ins).then((out) => outProcessor(ctx, out));
        };
    }
    createMiddleware(config) {
        if (typeof config === "string") {
            const scriptPath = getScriptPath(config);
            if (scriptPath !== config && fs_1.existsSync(scriptPath)) {
                // compiled chiml
                return (...ins) => {
                    const fn = require(scriptPath);
                    const normalIns = getNormalizedIns(ins);
                    return fn(...normalIns);
                };
            }
            // uncompiled chiml
            return (...ins) => tools_1.execute(config, ...ins);
        }
        // function
        return (...ins) => Promise.resolve(config(...ins));
    }
}
exports.WebApp = WebApp;
function defaultOutProcessor(ctx, out) {
    ctx.body = (ctx.body || "") + String(out);
}
function getScriptPath(str) {
    return str.replace(/^(.*)\.chiml$/gmi, "$1.js");
}
function getNormalizedIns(ins) {
    return ins.map((element) => {
        try {
            return JSON.parse(element);
        }
        catch (error) {
            return element;
        }
    });
}
//# sourceMappingURL=WebApp.js.map