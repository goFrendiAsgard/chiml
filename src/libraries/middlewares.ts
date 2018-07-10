import {existsSync as fsExistsSync} from "fs";
import * as koaRoute from "koa-route";
import {readFromStream} from "./stream";
import {execute} from "./tools";

export function defaultOutProcessor(ctx: {[key: string]: any}, out: any): any {
  ctx.body = (ctx.body || "") + String(out);
}

enum JREC {
  ParseError     = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams  = -32602,
  InternalError  = -32603,
}

const defaultMiddlewareConfig = {
  controller: (...ins) => ins.slice(0, -1).join(""),
  outProcessor: defaultOutProcessor,
  propagateCtx: true,
};

const defaultRouteConfig = {
  method: "all",
  propagateCtx: false,
  url: "/",
};

export function createAuthenticationMiddleware(config: {[key: string]: any}): (...ins: any[]) => any {
  const normalizedConfig = Object.assign({propagateCtx: true}, config);
  const handler = createHandler(normalizedConfig);
  return (ctx, ...ins) => {
    handler(ctx, ...ins).then((out) => {
      ctx.auth = ctx.auth || out;
    });
  };
}

export function createAuthorizationMiddleware(config: {[key: string]: any}): (...ins: any[]) => any {
  const normalizedConfig = Object.assign({ propagateCtx: true }, config);
  const handler = createHandler(normalizedConfig);
  return (ctx, ...ins) => {
    handler(ctx, ...ins).then((out) => {
      let roles: string[] = [];
      if (Array.isArray(out)) {
        roles = out;
      } else {
        roles.push(out);
      }
      if (roles.length === 0) {
        roles.push("loggedOut");
      } else {
        roles.push("loggedIn");
      }
      ctx.roles = (ctx.roles || []).concat(roles.filter((role) => ctx.roles.indexOf(role) === -1));
      if (!ctx.auth) {
        ctx.auth = out;
      }
    });
  };
}

export function createJsonRpcMiddleware(url: string, configs: any[], method: string = "all"): (...ins: any[]) => any {
  const normalizedConfigs = configs.map((config) => {
    return Object.assign({propagateCtx: false, controller: (...ins) => ins}, config);
  });
  const handler = createJsonRpcHandler(normalizedConfigs);
  return koaRoute[method](url, handler);
}

export function createRouteMiddleware(config: {[key: string]: any}): (...ins: any[]) => any {
  const routeConfig = Object.assign({}, defaultRouteConfig, config);
  const {method, url} = routeConfig;
  const handler = createHandler(routeConfig);
  return koaRoute[method](url, handler);
}

export function createMiddleware(config: {[key: string]: any}): (...ins: any[]) => any {
  return createHandler(config);
}

function createHandler(config: {[key: string]: any}): (...ins: any[]) => any {
  const normalizedConfig = Object.assign({}, defaultMiddlewareConfig, config);
  const {controller, propagateCtx, outProcessor} = normalizedConfig;
  if (!propagateCtx) {
    const subHandler = createHandler({
      controller,
      outProcessor,
      propagateCtx: true,
    });
    return (ctx: {[key: string]: any}, ...ins: any[]) => {
      return subHandler(...ins).then((out) => outProcessor(ctx, out));
    };
  }
  if (typeof controller === "string") {
    const scriptPath = getScriptPath(controller);
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
  return (...ins: any[]) => Promise.resolve(controller(...ins));
}

function jsonRpcErrorProcessor(ctx: {[key: string]: any}, errorObj: {[key: string]: any}): void {
  const {id, code} = errorObj;
  let {data, message} = errorObj;
  const jsonrpc = "2.0";
  switch (code) {
    case JREC.ParseError: data = "Parse Error"; break;
    case JREC.InvalidRequest: data = "Invalid Request"; break;
    case JREC.MethodNotFound: data = "Method Not Found"; break;
    case JREC.InvalidParams: data = "Invalid Params"; break;
    case JREC.InternalError: data = "Internal Error"; break;
  }
  if (!message) {
    message = "";
  }
  ctx.body = JSON.stringify({id, jsonrpc, error: {code, data, message}});
}

function isValidJsonRpcId(id): boolean {
  return id === null || id === undefined || typeof id === "string" ||
      (typeof id === "number" && Number.isSafeInteger(id));
}

function createJsonRpcHandler(configs: any[]): (...ins: any[]) => any {
  return async (ctx: {[key: string]: any}, ...ins: any[]) => {
    let jsonRequest;
    try {
      const request = await readFromStream(ctx.req);
      jsonRequest = JSON.parse(request);
    } catch (error) {
      console.log(error);
      return jsonRpcErrorProcessor(ctx, {code: JREC.ParseError});
    }
    const {id, jsonrpc, method, params} = jsonRequest;
    if (!isValidJsonRpcId(id)) {
      return jsonRpcErrorProcessor(ctx, {code: JREC.InvalidRequest,
        message: "id should be null, undefined, or interger"});
    }
    if (jsonrpc !== "2.0") {
      return jsonRpcErrorProcessor(ctx, {code: JREC.InvalidRequest,
        message: 'jsonrpc must be exactly "2.0"'});
    }
    if (typeof method !== "string") {
      return jsonRpcErrorProcessor(ctx, {code: JREC.InvalidRequest,
        message: "method must be string"});
    }
    if (!Array.isArray(params)) {
      return jsonRpcErrorProcessor(ctx, {code: JREC.InvalidParams,
        message: "invalid params"});
    }
    const matchedConfigs = configs.filter((config) => config.method === method);
    if (matchedConfigs.length < 1) {
      return jsonRpcErrorProcessor(ctx, {code: JREC.MethodNotFound,
        message: "method not found"});
    }
    try {
      const matchedConfig = matchedConfigs[0];
      const {controller, propagateCtx} = matchedConfig;
      const handler = createHandler({
        controller,
        outProcessor: (context, out) => {
          context.body = JSON.stringify({id, jsonrpc, result: out});
        },
        propagateCtx,
      });
      return await handler(ctx, ...params);
    } catch (error) {
      console.log(error);
      return jsonRpcErrorProcessor(ctx, {code: JREC.InternalError});
    }
  };
}

function getScriptPath(str) {
  return str.replace(/^(.*)\.chiml$/gmi, "$1.js");
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