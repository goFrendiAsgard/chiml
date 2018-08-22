import * as Koa from "koa";
export declare function createAuthenticationMiddleware(config: {
    [key: string]: any;
}): (...ins: any[]) => any;
export declare function createAuthorizationMiddleware(config: {
    [key: string]: any;
}): (...ins: any[]) => any;
export declare function createJsonRpcMiddleware(url: string, configs: any[], method?: string): (...ins: any[]) => any;
export declare function createRouteMiddleware(config: {
    [key: string]: any;
}): (...ins: any[]) => any;
export declare function createMiddleware(middlewareConfig: any): (...ins: any[]) => any;
export declare function isAuthorized(ctx: Koa.Context, config: {
    [key: string]: string;
}): boolean;
export declare function createBareMiddleware(controller: any): (...ins: any[]) => any;
