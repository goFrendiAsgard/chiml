import {existsSync as fsExistsSync} from "fs";
import {createServer as httpCreateServer, Server as httpServer} from "http";
import * as Koa from "koa";
import * as koaRoute from "koa-route";
import {execute} from "../libraries/tools";

export class WebApp extends Koa {

  public createServer(): httpServer {
    return httpCreateServer(this.callback());
  }

  public addMiddleware(config: any): void {
    this.use(this.createMiddleware(config));
  }

  public addJsonRpcPage(url: string, configs: any[]): void {
    // write logics here
  }

  public addRoute(method: string, url: string, config: any): void {
    const middleware = this.createMiddleware(config);
    this.use(koaRoute[method](url, middleware));
  }

  public addPage(
    method: string, url: string, config: any,
    outProcessor: (ctx: {[key: string]: any}, out: any) => any = defaultOutProcessor,
  ): void {
    const middleware = this.createPageMiddleware(config, outProcessor);
    this.use(koaRoute[method](url, middleware));
  }

  protected createPageMiddleware(
    config: any, outProcessor: (ctx: {[key: string]: any}, out: any) => any,
  ): (...ins: any[]) => any {
    const middleware = this.createMiddleware(config);
    return (ctx: {[key: string]: any}, ...ins: any[]) => {
      return middleware(...ins).then((out) => outProcessor(ctx, out));
    };
  }

  protected createMiddleware(config: any): (...ins: any[]) => any {
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

}

function defaultOutProcessor(ctx: {[key: string]: any}, out: any): any {
  ctx.body = (ctx.body || "") + String(out);
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
