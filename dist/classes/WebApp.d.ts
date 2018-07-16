/// <reference types="node" />
import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
import * as socketIo from "socket.io";
export declare class WebApp extends Koa {
    createServer: () => http.Server;
    createIo(server: http.Server | https.Server, options?: socketIo.ServerOptions): socketIo.Server;
    createHttpServer(): http.Server;
    createHttpsServer(options?: {
        [key: string]: any;
    }): https.Server;
    addJsonRpc(url: string, configs: any[]): void;
    addAuthentication(config: {
        [key: string]: any;
    }): void;
    addAuthorization(config: {
        [key: string]: any;
    }): void;
    addMiddlewares(controllers: any[]): void;
    addRoutes(configs: Array<{
        [key: string]: any;
    }>): void;
    addMiddleware(controller: any): void;
    addRoute(config: {
        [key: string]: any;
    }): void;
}
