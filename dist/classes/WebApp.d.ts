/// <reference types="node" />
import { Server as httpServer } from "http";
import * as Koa from "koa";
export declare class WebApp extends Koa {
    createServer(): httpServer;
    addMiddleware(config: any): void;
    addRoute(method: string, url: string, config: any): void;
    protected createMiddleware(config: any): (...ins: any[]) => any;
}
