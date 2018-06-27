import {existsSync as fsExistsSync} from "fs";
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

export function createJsonRpcMiddleware(configs: any[]): (...ins: any[]) => any {
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
      const middleware = this.createMiddleware(controller, propagateCtx, (context, out) => {
        context.body = JSON.stringify({id, jsonrpc, result: out});
      });
      return await middleware(ctx, ...params);
    } catch (error) {
      console.log(error);
      return jsonRpcErrorProcessor(ctx, {code: JREC.InternalError});
    }
  };
}

export function createMiddleware(
  config: any, propagateCtx: boolean = true,
  outProcessor: (ctx: {[key: string]: any}, out: any) => any = defaultOutProcessor,
): (...ins: any[]) => any {
  if (!propagateCtx) {
    const middleware = this.createMiddleware(config, true, outProcessor);
    return (ctx: {[key: string]: any}, ...ins: any[]) => {
      return middleware(...ins).then((out) => outProcessor(ctx, out));
    };
  }
  if (typeof config === "string") {
    const scriptPath = getScriptPath(config);
    if (scriptPath !== config && fsExistsSync(scriptPath)) {
      // compiled chiml
      return (...ins: any[]) => {
        const fn = require(scriptPath);
        const normalIns = getNormalizedIns(ins);
        return fn(...normalIns);
      };
    }
    // uncompiled chiml
    return (...ins: any[]) => execute(config, ...ins);
  }
  // function
  return (...ins: any[]) => Promise.resolve(config(...ins));
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
