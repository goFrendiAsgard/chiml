export declare class JsonRpcProxy {
    private url;
    constructor(url: string);
    call(method: string, ...params: any[]): void;
}
