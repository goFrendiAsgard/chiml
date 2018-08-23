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
const Logger_1 = require("../classes/Logger");
const cmd_1 = require("./cmd");
const stream_1 = require("./stream");
const tools_1 = require("./tools");
const defaultLogger = new Logger_1.Logger();
var JREC;
(function (JREC) {
    JREC[JREC["ParseError"] = -32700] = "ParseError";
    JREC[JREC["InvalidRequest"] = -32600] = "InvalidRequest";
    JREC[JREC["MethodNotFound"] = -32601] = "MethodNotFound";
    JREC[JREC["InvalidParams"] = -32602] = "InvalidParams";
    JREC[JREC["InternalError"] = -32603] = "InternalError";
})(JREC || (JREC = {}));
const defaultRoles = ["loggedIn", "loggedOut"];
function defaultOutProcessor(ctx, out) {
    ctx.body = (ctx.body || "") + String(out);
}
function defaultAuthorizationWrapper(middleware, config) {
    return (ctx, ...args) => {
        const routeMatch = isRouteMatch(ctx, config);
        if (isAuthorized(ctx, config)) {
            if (routeMatch) {
                ctx.status = 200;
            }
            return middleware(ctx, ...args);
        }
        if (routeMatch) {
            ctx.status = 401;
        }
        const next = args[args.length - 1];
        return next();
    };
}
function jsonRpcAuthorizationWrapper(middleware, config) {
    return (ctx, ...args) => {
        if (isAuthorized(ctx, config)) {
            return middleware(ctx, ...args);
        }
        return jsonRpcErrorProcessor(ctx, {
            code: JREC.MethodNotFound,
            message: "unauthorized access",
        });
    };
}
const defaultMiddlewareConfig = {
    authorizationWrapper: defaultAuthorizationWrapper,
    controller: (...ins) => ins.slice(0, -1).join(""),
    logger: defaultLogger,
    outProcessor: defaultOutProcessor,
    propagateContext: true,
    roles: defaultRoles,
};
const defaultRouteConfig = {
    authorizationWrapper: defaultAuthorizationWrapper,
    logger: defaultLogger,
    method: "all",
    propagateContext: false,
    roles: defaultRoles,
    url: "/",
};
function createAuthenticationMiddleware(config) {
    const normalizedConfig = Object.assign({}, { propagateContext: true }, config);
    const baseMiddleware = createMiddleware(normalizedConfig);
    return (ctx, next) => {
        return baseMiddleware(ctx)
            .then((out) => {
            ctx.state = ctx.state || {};
            ctx.state.user = ctx.state.user || out;
            return next();
        });
    };
}
exports.createAuthenticationMiddleware = createAuthenticationMiddleware;
function createAuthorizationMiddleware(config) {
    const normalizedConfig = Object.assign({}, { propagateContext: true }, config);
    const baseMiddleware = createMiddleware(normalizedConfig);
    return (ctx, next) => {
        return baseMiddleware(ctx)
            .then((out) => {
            let roles = [];
            if (out) {
                roles = Array.isArray(out) ? out : [out];
            }
            roles.push(ctx.state.user ? "loggedIn" : "loggedOut");
            ctx.state = ctx.state || {};
            ctx.state.roles = ctx.state.roles || [];
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
        const normalizedConfig = createNormalizedMiddlewareConfig(config);
        return Object.assign({}, { propagateContext: false, controller: (...ins) => ins }, normalizedConfig);
    });
    const middleware = createJsonRpcBaseMiddleware(normalizedConfigs);
    return koaRoute[method](url, middleware);
}
exports.createJsonRpcMiddleware = createJsonRpcMiddleware;
function createRouteMiddleware(config) {
    const normalizedConfig = createNormalizedMiddlewareConfig(config);
    const normalizedRouteConfig = Object.assign({}, defaultRouteConfig, normalizedConfig);
    const { method, url } = normalizedRouteConfig;
    const middleware = createMiddleware(normalizedRouteConfig);
    return koaRoute[method](url, middleware);
}
exports.createRouteMiddleware = createRouteMiddleware;
function createMiddleware(middlewareConfig) {
    const normalizedMiddlewareConfig = createNormalizedMiddlewareConfig(middlewareConfig);
    const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, normalizedMiddlewareConfig);
    const middleware = createMetaMiddleware(normalizedConfig);
    if ("authorizationWrapper" in normalizedConfig && normalizedConfig.authorizationWrapper) {
        return normalizedConfig.authorizationWrapper(middleware, normalizedConfig);
    }
    return middleware;
}
exports.createMiddleware = createMiddleware;
function createNormalizedMiddlewareConfig(middlewareConfig) {
    return isController(middlewareConfig) ? { controller: middlewareConfig } : middlewareConfig;
}
function isController(config) {
    const routeMiddlewareKeys = Object.keys(defaultRouteConfig);
    const middlewareKeys = Object.keys(defaultMiddlewareConfig);
    const keys = routeMiddlewareKeys.concat(middlewareKeys);
    if (config && typeof config === "object") {
        const existingKeys = Object.keys(config).filter((key) => keys.indexOf(key) > -1);
        return existingKeys.length === 0;
    }
    return true;
}
function isRouteConfig(config) {
    return config && "method" in config && config.method && "url" in config && config.url;
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
function isAuthorized(ctx, config) {
    const normalizedConfig = Object.assign({}, { roles: defaultRoles }, config);
    ctx.state = ctx.state || {};
    ctx.state.roles = ctx.state.roles || (ctx.state.user ? ["loggedIn"] : ["loggedOut"]);
    return ctx.state.roles.filter((role) => normalizedConfig.roles.indexOf(role) > -1).length > 0;
}
exports.isAuthorized = isAuthorized;
function createMetaMiddleware(config) {
    const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, config);
    const { controller, propagateContext, outProcessor } = normalizedConfig;
    if (propagateContext) {
        return createBareMiddleware(controller);
    }
    const subHandler = createBareMiddleware(controller);
    return (ctx, ...ins) => {
        return subHandler(...ins)
            .then((out) => outProcessor(ctx, out));
    };
}
function createBareMiddleware(controller) {
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
        if (result && typeof result === "object" && "then" in result) {
            // if the result is promise like, return it
            return result;
        }
        // if the result is not promise like, make a promise based on it
        return Promise.resolve(result);
    };
}
exports.createBareMiddleware = createBareMiddleware;
function jsonRpcSimpleErrorProcessor(ctx, id = null, code = JREC.InternalError, message = "") {
    const errorObj = { id, code, message };
    jsonRpcErrorProcessor(ctx, errorObj);
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
    message = message || "";
    ctx.body = JSON.stringify({ id, jsonrpc, error: { code, data, message } });
}
function isValidJsonRpcId(id) {
    return id === null || id === undefined || typeof id === "string" ||
        (typeof id === "number" && Number.isSafeInteger(id));
}
function createJsonRpcBaseMiddleware(configs) {
    const logger = Array.isArray(configs) && configs.length > 0 && "logger" in configs[0] ?
        configs[0].logger : defaultLogger;
    return (ctx, ...ins) => __awaiter(this, void 0, void 0, function* () {
        let jsonRequest;
        try {
            const request = yield stream_1.readFromStream(ctx.req);
            jsonRequest = JSON.parse(request);
        }
        catch (error) {
            defaultLogger.error(error);
            return jsonRpcSimpleErrorProcessor(ctx, null, JREC.ParseError);
        }
        const { id, jsonrpc, method, params } = jsonRequest;
        if (!isValidJsonRpcId(id)) {
            return jsonRpcSimpleErrorProcessor(ctx, id, JREC.InvalidRequest, "id should be null, undefined, or integer");
        }
        if (jsonrpc !== "2.0") {
            return jsonRpcSimpleErrorProcessor(ctx, id, JREC.InvalidRequest, 'jsonrpc must be exactly "2.0"');
        }
        if (typeof method !== "string") {
            return jsonRpcSimpleErrorProcessor(ctx, id, JREC.InvalidRequest, "method must be string");
        }
        if (!Array.isArray(params)) {
            return jsonRpcSimpleErrorProcessor(ctx, id, JREC.InvalidParams, "invalid params");
        }
        const matchedConfigs = configs.filter((config) => config.method === method);
        if (matchedConfigs.length < 1) {
            return jsonRpcSimpleErrorProcessor(ctx, id, JREC.MethodNotFound, "method not found");
        }
        try {
            const authorizationWrapper = jsonRpcAuthorizationWrapper;
            const outProcessor = (context, out) => {
                context.body = JSON.stringify({ id, jsonrpc, result: out });
            };
            const matchedConfig = Object.assign({}, matchedConfigs[0], {
                authorizationWrapper,
                outProcessor,
            });
            const middleware = createMiddleware(matchedConfig);
            return yield middleware(ctx, ...params);
        }
        catch (error) {
            defaultLogger.error(error);
            return jsonRpcSimpleErrorProcessor(ctx, id, JREC.InternalError);
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
