export declare function defaultOutProcessor(ctx: {
    [key: string]: any;
}, out: any): any;
export declare function createJsonRpcMiddleware(configs: any[]): (...ins: any[]) => any;
export declare function createMiddleware(config: {
    [key: string]: any;
}): (...ins: any[]) => any;
