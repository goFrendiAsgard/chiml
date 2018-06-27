/// <reference types="node" />
import * as http from "http";
import * as https from "https";
import * as Koa from "koa";
export declare class WebApp extends Koa {
    createServer: () => http.Server;
    createHttpServer(): http.Server;
    createHttpsServer(options?: {
        [key: string]: any;
    }): https.Server;
    addJsonRpcMiddleware(url: string, configs: any[]): void;
    addMiddlewares(configs: any[]): void;
    addRoutes(configs: Array<{
        [key: string]: any;
    }>): void;
    addMiddleware(config: any): void;
    addRoute(config: {
        [key: string]: any;
    }): void;
}
