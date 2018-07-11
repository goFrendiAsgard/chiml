import * as cacheRequirePaths from "cache-require-paths";
import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
import {
  createAuthenticationMiddleware,
  createAuthorizationMiddleware,
  createJsonRpcMiddleware,
  createMiddleware,
  createRouteMiddleware} from "../libraries/middlewares";

export class WebApp extends Koa {

  public createServer = this.createHttpServer;

  public createHttpServer(): http.Server {
    return http.createServer(this.callback());
  }

  public createHttpsServer(options: {[key: string]: any} = {}): https.Server {
    return https.createServer(options, this.callback());
  }

  public addJsonRpcMiddleware(url: string, configs: any[]): void {
    this.use(createJsonRpcMiddleware(url, configs));
  }

  public addAuthenticationMiddleware(config: {[key: string]: any}): void {
    this.use(createAuthenticationMiddleware(config));
  }

  public addAuthorizationMiddleware(config: {[key: string]: any}): void {
    this.use(createAuthorizationMiddleware(config));
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

  public addMiddleware(controller: any): void {
    this.use(createMiddleware({controller}));
  }

  public addRoute(config: {[key: string]: any}): void {
    this.use(createRouteMiddleware(config));
  }

}
