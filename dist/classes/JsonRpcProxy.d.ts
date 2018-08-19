export declare class JsonRpcProxy {
    private config;
    constructor(config: string | {
        [key: string]: string;
    });
    call(method: string, ...params: any[]): void;
}
