import { jsonRpcRequest } from "../libraries/http";

export class JsonRpcProxy {

    constructor(private url: string) {
    }

    public call(method: string, ...params: any[]) {
        jsonRpcRequest(this.url, method, ...params);
    }
}
