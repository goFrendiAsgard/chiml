import { JsonRpcProxy } from "../classes/JsonRpcProxy";

export function createJsonRpcProxy(url: string): JsonRpcProxy {
    return new JsonRpcProxy(url);
}
