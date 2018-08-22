import { IJsonRpcProxy } from "../interfaces/IJsonRpcProxy";
export declare class JsonRpcProxy implements IJsonRpcProxy {
    private config;
    constructor(config: string | {
        [key: string]: string;
    });
    call(method: string, ...params: any[]): void;
}
