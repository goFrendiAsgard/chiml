export interface IJsonRpcProxy {
    call(method: string, ...params: any[]): void;
}
