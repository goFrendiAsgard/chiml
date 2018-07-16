import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
import * as socketIo from "socket.io";
import {
  createAuthenticationMiddleware,
  createAuthorizationMiddleware,
  createJsonRpcMiddleware,
  createMiddleware,
  createRouteMiddleware} from "../libraries/middlewares";

export class WebApp extends Koa {

  public createServer = this.createHttpServer;

  public createIo(server: http.Server | https.Server, options?: socketIo.ServerOptions): socketIo.Server {
    const io = socketIo(server, options);
    io.use((socket, next) => {
      let error = null;
      try {
        // create `fake` ctx and share it with our io instance
        const ctx = this.createContext(socket.request, new http.ServerResponse(socket.request));
        Object.defineProperty(socket, "ctx", { value: ctx, writable: false });
      } catch (err) {
        error = err;
        console.error(err);
      }
      next(error);
    });
    return io;
  }

  public createHttpServer(): http.Server {
    return http.createServer(this.callback());
  }

  public createHttpsServer(options: {[key: string]: any} = {}): https.Server {
    return https.createServer(options, this.callback());
  }

  public addJsonRpc(url: string, configs: any[]): void {
    this.use(createJsonRpcMiddleware(url, configs));
  }

  public addAuthentication(config: {[key: string]: any}): void {
    this.use(createAuthenticationMiddleware(config));
  }

  public addAuthorization(config: {[key: string]: any}): void {
    this.use(createAuthorizationMiddleware(config));
  }

  public addMiddlewares(controllers: any[]): void {
    for (const controller of controllers) {
      this.addMiddleware(controller);
    }
  }

  public addRoutes(configs: Array<{[key: string]: any}>): void {
    for (const config of configs) {
      this.addRoute(config);
    }
  }

  public addMiddleware(controller: any): void {
    this.use(createMiddleware(controller));
  }

  public addRoute(config: {[key: string]: any}): void {
    this.use(createRouteMiddleware(config));
  }

}
