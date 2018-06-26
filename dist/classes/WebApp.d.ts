/// <reference types="node" />
import { Server as httpServer } from "http";
import * as Koa from "koa";
export declare class WebApp extends Koa {
    createServer(): httpServer;
    addMiddleware(config: any): void;
    addRoute(method: string, url: string, config: any): void;
    addPage(method: string, url: string, config: any, outProcessor?: (ctx: {
        [key: string]: any;
    }, out: any) => any): void;
    protected createPageMiddleware(config: any, outProcessor: (ctx: {
        [key: string]: any;
    }, out: any) => any): (...ins: any[]) => any;
    protected createMiddleware(config: any): (...ins: any[]) => any;
}
