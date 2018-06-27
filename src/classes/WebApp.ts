import * as cacheRequirePaths from "cache-require-paths";
import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
import * as koaRoute from "koa-route";
import * as httpMethods from "methods";
import {createJsonRpcMiddleware, createMiddleware, defaultOutProcessor} from "../libraries/middlewares";

const defaultPageConfig = {
  controller: (...ins) => ins.slice(0, -1).join(""),
  method: "all",
  outProcessor: defaultOutProcessor,
  propagateCtx: false,
  url: "/",
};

export class WebApp extends Koa {

  public createServer = this.createHttpServer;

  public createHttpServer(): http.Server {
    return http.createServer(this.callback());
  }

  public createHttpsServer(options: {[key: string]: any} = {}): https.Server {
    return https.createServer(options, this.callback());
  }

  public addJsonRpcMiddleware(url: string, configs: any[]): void {
    const normalizedConfigs = configs.map((config) => {
      return Object.assign({method: null, propagateCtx: false, controller: (...ins) => ins}, config);
    });
    const jsonRpcMiddleware = createJsonRpcMiddleware(normalizedConfigs);
    for (const httpMethod of httpMethods) {
      this.use(koaRoute[httpMethod](url, jsonRpcMiddleware));
    }
  }

  public addMiddlewares(configs: any[]): void {
    for (const config of configs) {
      this.addMiddleware(config);
    }
  }

  public addRoutes(configs: Array<{[key: string]: any}>): void {
    for (const config of configs) {
      this.addRoute(config);
    }
  }

  public addMiddleware(config: any): void {
    this.use(createMiddleware(config));
  }

  public addRoute(config: {[key: string]: any}): void {
    const {method, url, controller, propagateCtx, outProcessor} = Object.assign({}, defaultPageConfig, config);
    const middleware = createMiddleware(controller, propagateCtx, outProcessor);
    this.use(koaRoute[method](url, middleware));
  }

}
