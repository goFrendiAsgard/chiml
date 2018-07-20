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
const fs_1 = require("fs");
const koaRoute = require("koa-route");
const pathToRegexp = require("path-to-regexp");
const cmd_1 = require("./cmd");
const stream_1 = require("./stream");
const tools_1 = require("./tools");
function defaultOutProcessor(ctx, out) {
    ctx.body = (ctx.body || "") + String(out);
}
exports.defaultOutProcessor = defaultOutProcessor;
var JREC;
(function (JREC) {
    JREC[JREC["ParseError"] = -32700] = "ParseError";
    JREC[JREC["InvalidRequest"] = -32600] = "InvalidRequest";
    JREC[JREC["MethodNotFound"] = -32601] = "MethodNotFound";
    JREC[JREC["InvalidParams"] = -32602] = "InvalidParams";
    JREC[JREC["InternalError"] = -32603] = "InternalError";
})(JREC || (JREC = {}));
const defaultRoles = ["loggedIn", "loggedOut"];
const defaultMiddlewareConfig = {
    controller: (...ins) => ins.slice(0, -1).join(""),
    outProcessor: defaultOutProcessor,
    propagateContext: true,
    roles: defaultRoles,
};
const defaultRouteConfig = {
    method: "all",
    propagateContext: false,
    roles: defaultRoles,
    url: "/",
};
function createAuthenticationMiddleware(config) {
    const normalizedConfig = Object.assign({}, { propagateContext: true }, config);
    const handler = createHandler(normalizedConfig);
    return (ctx, next) => {
        return handler(ctx).then((out) => {
            ctx.state = defineIfNotSet(ctx.state, {});
            ctx.state.user = defineIfNotSet(ctx.state.user, out);
            return next();
        });
    };
}
exports.createAuthenticationMiddleware = createAuthenticationMiddleware;
function createAuthorizationMiddleware(config) {
    const normalizedConfig = Object.assign({}, { propagateContext: true }, config);
    const handler = createHandler(normalizedConfig);
    return (ctx, next) => {
        return handler(ctx).then((out) => {
            let roles = [];
            if (Array.isArray(out)) {
                roles = out;
            }
            else if (out !== null && typeof out !== "undefined") {
                roles.push(out);
            }
            roles.push(ctx.state.user ? "loggedIn" : "loggedOut");
            ctx.state = defineIfNotSet(ctx.state, {});
            ctx.state.roles = defineIfNotSet(ctx.state.roles, []);
            ctx.state.roles = ctx.state.roles.concat(roles.filter((role) => ctx.state.roles.indexOf(role) === -1)).filter((role) => {
                return (role === "loggedOut" && ctx.state.user) ? false : true;
            });
            return next();
        });
    };
}
exports.createAuthorizationMiddleware = createAuthorizationMiddleware;
function createJsonRpcMiddleware(url, configs, method = "all") {
    const normalizedConfigs = configs.map((config) => {
        return Object.assign({}, { propagateContext: false, controller: (...ins) => ins }, config);
    });
    const handler = createJsonRpcHandler(normalizedConfigs);
    const middleware = koaRoute[method](url, handler);
    return middleware;
}
exports.createJsonRpcMiddleware = createJsonRpcMiddleware;
function createRouteMiddleware(config) {
    const routeConfig = Object.assign({}, defaultRouteConfig, config);
    const { method, url } = routeConfig;
    const handler = createHandler(routeConfig);
    const middleware = koaRoute[method](url, handler);
    return createAuthorizedMiddleware(middleware, routeConfig);
}
exports.createRouteMiddleware = createRouteMiddleware;
function createMiddleware(controller) {
    const config = { controller };
    const middleware = createHandler(config);
    return createAuthorizedMiddleware(middleware, config);
}
exports.createMiddleware = createMiddleware;
function defineIfNotSet(obj, val) {
    return obj || val;
}
function isRouteConfig(config) {
    return "method" in config && "url" in config;
}
function isRouteMethodMatch(ctx, method) {
    const upperCasedMethod = method.toUpperCase();
    return upperCasedMethod === "ALL" ||
        ctx.method === upperCasedMethod ||
        (upperCasedMethod === "GET" && ctx.method === "HEAD");
}
function isRouteMatch(ctx, config) {
    if (isRouteConfig(config) && isRouteMethodMatch(ctx, config.method)) {
        const re = pathToRegexp(config.url);
        return re.exec(ctx.url) ? true : false;
    }
    return false;
}
function createAuthorizedMiddleware(middleware, config) {
    return (ctx, next) => {
        const routeMatch = isRouteMatch(ctx, config);
        if (isAuthorized(ctx, config)) {
            if (routeMatch) {
                ctx.status = 200;
            }
            return middleware(ctx, next);
        }
        if (routeMatch) {
            ctx.status = 401;
        }
        return next();
    };
}
function isAuthorized(ctx, config) {
    const normalizedConfig = Object.assign({}, { roles: defaultRoles }, config);
    ctx.state = defineIfNotSet(ctx.state, {});
    ctx.state.roles = defineIfNotSet(ctx.state.roles, (ctx.state.user ? ["loggedIn"] : ["loggedOut"]));
    return ctx.state.roles.filter((role) => normalizedConfig.roles.indexOf(role) > -1).length > 0;
}
function createHandler(config) {
    const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, config);
    const { controller, propagateContext, outProcessor } = normalizedConfig;
    if (!propagateContext) {
        const subHandler = createHandler({
            controller,
            outProcessor,
            propagateContext: true,
        });
        return (ctx, ...ins) => {
            return subHandler(...ins).then((out) => outProcessor(ctx, out));
        };
    }
    if (typeof controller === "string") {
        const scriptPath = cmd_1.getChimlCompiledScriptPath(controller, process.cwd());
        if (scriptPath !== controller && fs_1.existsSync(scriptPath)) {
            // compiled chiml
            return (...ins) => {
                const fn = require(scriptPath);
                const normalIns = getNormalizedIns(ins);
                return fn(...normalIns);
            };
        }
        // uncompiled chiml
        return (...ins) => tools_1.execute(controller, ...ins);
    }
    // function
    return (...ins) => {
        const result = controller(...ins);
        try {
            if ("then" in result) {
                // if the result is promise like, return it
                return result;
            }
        }
        catch (error) {
            // do nothing
        }
        // if the result is not promise like, make a promise based on it
        return Promise.resolve(result);
    };
}
function jsonRpcErrorProcessor(ctx, errorObj) {
    const { id, code } = errorObj;
    let { data, message } = errorObj;
    const jsonrpc = "2.0";
    switch (code) {
        case JREC.ParseError:
            data = "Parse Error";
            break;
        case JREC.InvalidRequest:
            data = "Invalid Request";
            break;
        case JREC.MethodNotFound:
            data = "Method Not Found";
            break;
        case JREC.InvalidParams:
            data = "Invalid Params";
            break;
        case JREC.InternalError:
            data = "Internal Error";
            break;
    }
    if (!message) {
        message = "";
    }
    ctx.body = JSON.stringify({ id, jsonrpc, error: { code, data, message } });
}
function isValidJsonRpcId(id) {
    return id === null || id === undefined || typeof id === "string" ||
        (typeof id === "number" && Number.isSafeInteger(id));
}
function createJsonRpcHandler(configs) {
    return (ctx, ...ins) => __awaiter(this, void 0, void 0, function* () {
        let jsonRequest;
        try {
            const request = yield stream_1.readFromStream(ctx.req);
            jsonRequest = JSON.parse(request);
        }
        catch (error) {
            console.log(error);
            return jsonRpcErrorProcessor(ctx, { code: JREC.ParseError });
        }
        const { id, jsonrpc, method, params } = jsonRequest;
        if (!isValidJsonRpcId(id)) {
            return jsonRpcErrorProcessor(ctx, { code: JREC.InvalidRequest,
                message: "id should be null, undefined, or interger" });
        }
        if (jsonrpc !== "2.0") {
            return jsonRpcErrorProcessor(ctx, { code: JREC.InvalidRequest,
                message: 'jsonrpc must be exactly "2.0"' });
        }
        if (typeof method !== "string") {
            return jsonRpcErrorProcessor(ctx, { code: JREC.InvalidRequest,
                message: "method must be string" });
        }
        if (!Array.isArray(params)) {
            return jsonRpcErrorProcessor(ctx, { code: JREC.InvalidParams,
                message: "invalid params" });
        }
        const matchedConfigs = configs.filter((config) => config.method === method);
        if (matchedConfigs.length < 1) {
            return jsonRpcErrorProcessor(ctx, { code: JREC.MethodNotFound,
                message: "method not found" });
        }
        try {
            const matchedConfig = matchedConfigs[0];
            if (!isAuthorized(ctx, matchedConfig)) {
                return jsonRpcErrorProcessor(ctx, { code: JREC.MethodNotFound,
                    message: "unauthorized access" });
            }
            const { controller, propagateContext } = matchedConfig;
            const handler = createHandler({
                controller,
                outProcessor: (context, out) => {
                    context.body = JSON.stringify({ id, jsonrpc, result: out });
                },
                propagateContext,
            });
            return yield handler(ctx, ...params);
        }
        catch (error) {
            console.log(error);
            return jsonRpcErrorProcessor(ctx, { code: JREC.InternalError });
        }
    });
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
//# sourceMappingURL=middlewares.js.map