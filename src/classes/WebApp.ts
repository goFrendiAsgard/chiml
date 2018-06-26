import {createServer as httpCreateServer, Server as httpServer} from "http";
import * as Koa from "koa";
import * as koaRoute from "koa-route";
import {execute} from "../libraries/tools";

function defaultOutProcessor(ctx: {[key: string]: any}, out: any): any {
  ctx.body = (ctx.body || "") + String(out);
}

export class WebApp extends Koa {

  public createServer(): httpServer {
    return httpCreateServer(this.callback());
  }

  public addMiddleware(config: any): void {
    this.use(this.createMiddleware(config));
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
    if (typeof config === "string") {
      return (ctx: {[key: string]: any}, ...ins: any[]) => {
        return execute(config, ...ins).then((out) => {
          outProcessor(ctx, out);
        });
      };
    }
    return (ctx, ...ins: any[]) => {
      const out = config(...ins);
      outProcessor(ctx, out);
    };
  }

  protected createMiddleware(config: any): (...ins: any[]) => any {
    if (typeof config === "string") {
      return (...ins: any[]) => {
        return execute(config, ...ins);
      };
    }
    return config;
  }

}
