export declare function defaultOutProcessor(ctx: {
    [key: string]: any;
}, out: any): any;
export declare function createJsonRpcMiddleware(configs: any[]): (...ins: any[]) => any;
export declare function createMiddleware(config: any, propagateCtx?: boolean, outProcessor?: (ctx: {
    [key: string]: any;
}, out: any) => any): (...ins: any[]) => any;
