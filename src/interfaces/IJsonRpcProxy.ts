export interface IJsonRpcProxy {
    // methods
    call(method: string, ...params: any[]): void;
}
