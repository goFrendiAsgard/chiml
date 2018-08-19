import { jsonRpcRequest } from "../libraries/http";

export class JsonRpcProxy {

    constructor(private config: string | {[key: string]: string}) {
    }

    public call(method: string, ...params: any[]) {
        jsonRpcRequest(this.config, method, ...params);
    }
}
