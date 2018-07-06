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
const defaultMiddlewareConfig = {
    controller: (...ins) => ins.slice(0, -1).join(""),
    outProcessor: defaultOutProcessor,
    propagateCtx: true,
};
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
function createJsonRpcMiddleware(configs) {
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
            const { controller, propagateCtx } = matchedConfig;
            const middleware = this.createMiddleware({
                controller,
                outProcessor: (context, out) => {
                    context.body = JSON.stringify({ id, jsonrpc, result: out });
                },
                propagateCtx,
            });
            return yield middleware(ctx, ...params);
        }
        catch (error) {
            console.log(error);
            return jsonRpcErrorProcessor(ctx, { code: JREC.InternalError });
        }
    });
}
exports.createJsonRpcMiddleware = createJsonRpcMiddleware;
function createMiddleware(config) {
    const { controller, propagateCtx, outProcessor } = Object.assign({}, defaultMiddlewareConfig, config);
    if (!propagateCtx) {
        const middleware = this.createMiddleware({
            controller,
            outProcessor,
            propagateCtx: true,
        });
        return (ctx, ...ins) => {
            return middleware(...ins).then((out) => outProcessor(ctx, out));
        };
    }
    if (typeof controller === "string") {
        const scriptPath = getScriptPath(controller);
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
    return (...ins) => Promise.resolve(controller(...ins));
}
exports.createMiddleware = createMiddleware;
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
//# sourceMappingURL=middlewares.js.map