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

  public addRoute(method: string, url: string, config: any): void {
    const middleware = this.createMiddleware(config);
    this.use(koaRoute[method](url, middleware));
  }

  protected createMiddleware(config: any): (...ins: any[]) => any {
    if (typeof config === "string") {
      return (...ins: any[]) => {
        const promise = execute(config, ...ins);
        console.log([config, promise]);
        return promise;
      };
    }
    return config;
  }

}
