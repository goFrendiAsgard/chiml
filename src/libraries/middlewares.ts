import { existsSync as fsExistsSync } from "fs";
import * as Koa from "koa";
import * as koaRoute from "koa-route";
import * as pathToRegexp from "path-to-regexp";
import { getChimlCompiledScriptPath } from "./cmd";
import { readFromStream } from "./stream";
import { execute } from "./tools";

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
        if (!isAuthorized(ctx, config)) {
            return jsonRpcErrorProcessor(ctx, {
                code: JREC.MethodNotFound,
                message: "unauthorized access",
            });
        }
        return middleware(ctx, ...args);
    };
}

const defaultMiddlewareConfig = {
    authorizationWrapper: defaultAuthorizationWrapper,
    controller: (...ins) => ins.slice(0, -1).join(""),
    outProcessor: defaultOutProcessor,
    propagateContext: true,
    roles: defaultRoles,
};

const defaultRouteConfig = {
    authorizationWrapper: defaultAuthorizationWrapper,
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
        return Object.assign({}, { propagateContext: false, controller: (...ins) => ins }, config);
    });
    const middleware = createJsonRpcBaseMiddleware(normalizedConfigs);
    return koaRoute[method](url, middleware);
}

export function createRouteMiddleware(config: { [key: string]: any }): (...ins: any[]) => any {
    const normalizedRouteConfig = Object.assign({}, defaultRouteConfig, config);
    const { method, url } = normalizedRouteConfig;
    const middleware = createMiddleware(normalizedRouteConfig);
    return koaRoute[method](url, middleware);
}

export function createMiddleware(middlewareConfig: any): (...ins: any[]) => any {
    const normalizedMiddlewareConfig = isController(middlewareConfig) ?
        { controller: middlewareConfig } : middlewareConfig;
    const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, normalizedMiddlewareConfig);
    const middleware = createHandler(normalizedConfig);
    if ("authorizationWrapper" in normalizedConfig && normalizedConfig.authorizationWrapper) {
        return normalizedConfig.authorizationWrapper(middleware, normalizedConfig);
    }
    return middleware;
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
    return "method" in config && "url" in config;
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

function isAuthorized(ctx: Koa.Context, config: { [key: string]: string }): boolean {
    const normalizedConfig = Object.assign({}, { roles: defaultRoles }, config);
    ctx.state = ctx.state || {};
    ctx.state.roles = ctx.state.roles || (ctx.state.user ? ["loggedIn"] : ["loggedOut"]);
    return ctx.state.roles.filter((role) => normalizedConfig.roles.indexOf(role) > -1).length > 0;
}

function createHandler(config: { [key: string]: any }): (...ins: any[]) => any {
    const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, config);
    const { controller, propagateContext, outProcessor } = normalizedConfig;
    if (!propagateContext) {
        const subHandler = createHandler({
            controller,
            outProcessor,
            propagateContext: true,
        });
        return (ctx: { [key: string]: any }, ...ins: any[]) => {
            return subHandler(...ins)
                .then((out) => outProcessor(ctx, out));
        };
    }
    if (typeof controller === "string") {
        const scriptPath = getChimlCompiledScriptPath(controller, process.cwd());
        if (scriptPath !== controller && fsExistsSync(scriptPath)) {
            // compiled chiml
            return (...ins: any[]) => {
                const fn = require(scriptPath);
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
        try {
            if ("then" in result) {
                // if the result is promise like, return it
                return result;
            }
        } catch (error) {
            // do nothing
        }
        // if the result is not promise like, make a promise based on it
        return Promise.resolve(result);
    };
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
    return async (ctx: Koa.Context, ...ins: any[]) => {
        let jsonRequest;
        try {
            const request = await readFromStream(ctx.req);
            jsonRequest = JSON.parse(request);
        } catch (error) {
            console.error(error);
            return jsonRpcErrorProcessor(ctx, { code: JREC.ParseError });
        }

        const { id, jsonrpc, method, params } = jsonRequest;
        if (!isValidJsonRpcId(id)) {
            return jsonRpcErrorProcessor(ctx, {
                code: JREC.InvalidRequest,
                message: "id should be null, undefined, or interger",
            });
        }
        if (jsonrpc !== "2.0") {
            return jsonRpcErrorProcessor(ctx, {
                code: JREC.InvalidRequest,
                message: 'jsonrpc must be exactly "2.0"',
            });
        }
        if (typeof method !== "string") {
            return jsonRpcErrorProcessor(ctx, {
                code: JREC.InvalidRequest,
                message: "method must be string",
            });
        }
        if (!Array.isArray(params)) {
            return jsonRpcErrorProcessor(ctx, {
                code: JREC.InvalidParams,
                message: "invalid params",
            });
        }

        const matchedConfigs = configs.filter((config) => config.method === method);
        if (matchedConfigs.length < 1) {
            return jsonRpcErrorProcessor(ctx, {
                code: JREC.MethodNotFound,
                message: "method not found",
            });
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
            console.log(error);
            return jsonRpcErrorProcessor(ctx, { code: JREC.InternalError });
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
