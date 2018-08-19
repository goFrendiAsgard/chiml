import { JsonRpcProxy } from "../classes/JsonRpcProxy";

export function createJsonRpcProxy(config: string | {[key: string]: string}): JsonRpcProxy {
    return new JsonRpcProxy(config);
}
