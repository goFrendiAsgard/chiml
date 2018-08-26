import { existsSync as fsExistsSync } from "fs";
import * as Koa from "koa";
import * as koaRoute from "koa-route";
import * as pathToRegexp from "path-to-regexp";
import { Logger } from "../classes/Logger";
import { getChimlCompiledScriptPath } from "./cmd";
import { readFromStream } from "./stream";
import { execute } from "./tools";

const defaultLogger = new Logger();

enum JREC {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
}

const defaultRoles = ["loggedIn", "loggedOut"];

function defaultOutProcessor(ctx: { [key: string]: any }, out: any): any {
    ctx.body = (ctx.body || "") + String(out);
}

function defaultAuthorizationWrapper(
    middleware: (ctx: Koa.Context, ...args: any[]) => any,
    config: { [key: string]: any },
): (ctx: Koa.Context, ...args: any[]) => any {
    return (ctx: Koa.Context, ...args: any[]) => {
        const routeMatch: boolean = isRouteMatch(ctx, config);
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

function jsonRpcAuthorizationWrapper(
    middleware: (ctx: Koa.Context, ...args: any[]) => any,
    config: { [key: string]: any },
): (ctx: Koa.Context, ...args: any[]) => any {
    return (ctx: Koa.Context, ...args: any[]) => {
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

export function createAuthenticationMiddleware(config: { [key: string]: any }): (...ins: any[]) => any {
    const normalizedConfig = Object.assign({}, { propagateContext: true }, config);
    const baseMiddleware = createMiddleware(normalizedConfig);
    return (ctx: Koa.Context, next) => {
        return baseMiddleware(ctx)
            .then((out) => {
                ctx.state = ctx.state || {};
                ctx.state.user = ctx.state.user || out;
                return next();
            });
    };
}

export function createAuthorizationMiddleware(config: { [key: string]: any }): (...ins: any[]) => any {
    const normalizedConfig = Object.assign({}, { propagateContext: true }, config);
    const baseMiddleware = createMiddleware(normalizedConfig);
    return (ctx: Koa.Context, next) => {
        return baseMiddleware(ctx)
            .then((out) => {
                let roles: string[] = [];
                if (out) {
                    roles = Array.isArray(out) ? out : [out];
                }
                roles.push(ctx.state.user ? "loggedIn" : "loggedOut");
                ctx.state = ctx.state || {};
                ctx.state.roles = ctx.state.roles || [];
                ctx.state.roles = ctx.state.roles.concat(
                    roles.filter((role) => ctx.state.roles.indexOf(role) === -1),
                ).filter((role) => {
                    return (role === "loggedOut" && ctx.state.user) ? false : true;
                });
                return next();
            });
    };
}

export function createJsonRpcMiddleware(url: string, configs: any[], method: string = "all"): (...ins: any[]) => any {
    const normalizedConfigs = configs.map((config) => {
        const normalizedConfig = createNormalizedMiddlewareConfig(config);
        return Object.assign({}, { propagateContext: false, controller: (...ins) => ins }, normalizedConfig);
    });
    const middleware = createJsonRpcBaseMiddleware(normalizedConfigs);
    return koaRoute[method](url, middleware);
}

export function createRouteMiddleware(config: { [key: string]: any }): (...ins: any[]) => any {
    const normalizedConfig = createNormalizedMiddlewareConfig(config);
    const normalizedRouteConfig = Object.assign({}, defaultRouteConfig, normalizedConfig);
    const { method, url } = normalizedRouteConfig;
    const middleware = createMiddleware(normalizedRouteConfig);
    return koaRoute[method](url, middleware);
}

export function createMiddleware(middlewareConfig: any): (...ins: any[]) => any {
    const normalizedMiddlewareConfig = createNormalizedMiddlewareConfig(middlewareConfig);
    const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, normalizedMiddlewareConfig);
    const middleware = createMetaMiddleware(normalizedConfig);
    if ("authorizationWrapper" in normalizedConfig && normalizedConfig.authorizationWrapper) {
        return normalizedConfig.authorizationWrapper(middleware, normalizedConfig);
    }
    return middleware;
}

function createNormalizedMiddlewareConfig(middlewareConfig: any): (...ins: any[]) => any {
    return isController(middlewareConfig) ? { controller: middlewareConfig } : middlewareConfig;
}

function isController(config: any): boolean {
    const routeMiddlewareKeys: string[] = Object.keys(defaultRouteConfig);
    const middlewareKeys: string[] = Object.keys(defaultMiddlewareConfig);
    const keys: string[] = routeMiddlewareKeys.concat(middlewareKeys);
    if (config && typeof config === "object") {
        const existingKeys = Object.keys(config).filter((key) => keys.indexOf(key) > -1);
        return existingKeys.length === 0;
    }
    return true;
}

function isRouteConfig(config: { [key: string]: any }): boolean {
    return config && config.method && config.url;
}

function isRouteMethodMatch(ctx: Koa.Context, method: string) {
    const upperCasedMethod = method.toUpperCase();
    return upperCasedMethod === "ALL" ||
        ctx.method === upperCasedMethod ||
        (upperCasedMethod === "GET" && ctx.method === "HEAD");
}

function isRouteMatch(ctx: Koa.Context, config: { [key: string]: any }) {
    if (isRouteConfig(config) && isRouteMethodMatch(ctx, config.method)) {
        const re: RegExp = pathToRegexp(config.url);
        return re.exec(ctx.url) ? true : false;
    }
    return false;
}

export function isAuthorized(ctx: Koa.Context, config: { [key: string]: string }): boolean {
    const normalizedConfig = Object.assign({}, { roles: defaultRoles }, config);
    ctx.state = ctx.state || {};
    ctx.state.roles = ctx.state.roles || (ctx.state.user ? ["loggedIn"] : ["loggedOut"]);
    return ctx.state.roles.filter((role) => normalizedConfig.roles.indexOf(role) > -1).length > 0;
}

function createMetaMiddleware(config: { [key: string]: any }): (...ins: any[]) => any {
    const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, config);
    const { controller, propagateContext, outProcessor } = normalizedConfig;
    if (propagateContext) {
        return createBareMiddleware(controller);
    }
    const subHandler = createBareMiddleware(controller);
    return (ctx: { [key: string]: any }, ...ins: any[]) => {
        return subHandler(...ins)
            .then((out) => outProcessor(ctx, out));
    };
}

export function createBareMiddleware(controller: any): (...ins: any[]) => any {
    if (typeof controller === "string") {
        const scriptPath = getChimlCompiledScriptPath(controller, process.cwd());
        if (scriptPath !== controller && fsExistsSync(scriptPath)) {
            // compiled chiml
            return (...ins: any[]) => {
                const fn: (...ins: any[]) => any = require(scriptPath);
                const normalIns = getNormalizedIns(ins);
                return fn(...normalIns);
            };
        }
        // uncompiled chiml
        return (...ins: any[]) => execute(controller, ...ins);
    }
    // function
    return (...ins: any[]) => {
        const result: any = controller(...ins);
        if (result && typeof result === "object" && "then" in result) {
            // if the result is promise like, return it
            return result;
        }
        // if the result is not promise like, make a promise based on it
        return Promise.resolve(result);
    };
}

function jsonRpcSimpleErrorProcessor(
    ctx: Koa.Context, id: number = null, code: number = JREC.InternalError, message: string = "",
): void {
    const errorObj = { id, code, message };
    jsonRpcErrorProcessor(ctx, errorObj);
}

function jsonRpcErrorProcessor(ctx: Koa.Context, errorObj: { [key: string]: any }): void {
    const { id, code } = errorObj;
    let { data, message } = errorObj;
    const jsonrpc = "2.0";
    switch (code) {
        case JREC.ParseError: data = "Parse Error"; break;
        case JREC.InvalidRequest: data = "Invalid Request"; break;
        case JREC.MethodNotFound: data = "Method Not Found"; break;
        case JREC.InvalidParams: data = "Invalid Params"; break;
        case JREC.InternalError: data = "Internal Error"; break;
    }
    message = message || "";
    ctx.body = JSON.stringify({ id, jsonrpc, error: { code, data, message } });
}

function isValidJsonRpcId(id): boolean {
    return id === null || id === undefined || typeof id === "string" ||
        (typeof id === "number" && Number.isSafeInteger(id));
}

function createJsonRpcBaseMiddleware(configs: any[]): (...ins: any[]) => any {
    const logger = Array.isArray(configs) && configs.length > 0 && "logger" in configs[0] ?
        configs[0].logger : defaultLogger;
    return async (ctx: Koa.Context, ...ins: any[]) => {
        let jsonRequest;
        try {
            const request = await readFromStream(ctx.req);
            jsonRequest = JSON.parse(request);
        } catch (error) {
            defaultLogger.error(error);
            return jsonRpcSimpleErrorProcessor(ctx, null, JREC.ParseError);
        }

        const { id, jsonrpc, method, params } = jsonRequest;
        if (!isValidJsonRpcId(id)) {
            return jsonRpcSimpleErrorProcessor(
                ctx, id, JREC.InvalidRequest, "id should be null, undefined, or integer");
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
            return await middleware(ctx, ...params);
        } catch (error) {
            defaultLogger.error(error);
            return jsonRpcSimpleErrorProcessor(ctx, id, JREC.InternalError);
        }
    };
}

function getNormalizedIns(ins: any[]) {
    return ins.map((element) => {
        try {
            return JSON.parse(element);
        } catch (error) {
            return element;
        }
    });
}
