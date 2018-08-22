import { IJsonRpcProxy } from "../interfaces/IJsonRpcProxy";
import { jsonRpcRequest } from "../libraries/http";

export class JsonRpcProxy implements IJsonRpcProxy {

    constructor(private config: string | {[key: string]: string}) {
    }

    public call(method: string, ...params: any[]): void {
        jsonRpcRequest(this.config, method, ...params);
    }
}
