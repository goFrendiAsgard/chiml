import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
import * as socketIo from "socket.io";
import {ISocketIoEventListener} from "../interfaces/ISocketIoEventListener";
import {
  createAuthenticationMiddleware,
  createAuthorizationMiddleware,
  createJsonRpcMiddleware,
  createMiddleware,
  createRouteMiddleware} from "../libraries/middlewares";

export class WebApp extends Koa {

  public createServer = this.createHttpServer;

  public createIo(server: http.Server | https.Server): socketIo.Server {
    const self = this;
    const io = socketIo(server);
    let eventListeners: ISocketIoEventListener[] = [];
    const addEventListener = (config: ISocketIoEventListener) => eventListeners.push(config);
    const addEventListeners = (configs: ISocketIoEventListener[]) => {
      eventListeners = eventListeners.concat(configs);
    };
    Object.defineProperty(io, "eventListeners", {value: eventListeners, writable: false});
    Object.defineProperty(io, "addEventListener", {value: addEventListener, writable: false});
    Object.defineProperty(io, "addEventListeners", {value: addEventListeners, writable: false});
    Object.defineProperty(io, "applyEventListeners", {
      value: () => {
        io.on("connection", (socket) => {
          for (const eventListener of eventListeners) {
            const {event, handler} = eventListener;
            const middleware = createMiddleware(handler, {propagateContext: true});
            socket.on(event, middleware);
          }
        });
      },
      writable: false,
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
