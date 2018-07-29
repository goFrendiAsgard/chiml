import * as originalHttpRequest from "request";

export function httpRequest(config: any, callback: any) {
    originalHttpRequest(config, (error, response, body) => {
        callback(error, body);
    });
}

export function jsonRpcRequest(url: string, method: string, ...params: any[]) {
    const callback = params.pop();
    const requestConfig = {
        body: JSON.stringify({
            id: 1,
            jsonrpc: "2.0",
            method,
            params,
        }),
        method: "POST",
        url,
    };
    httpRequest(requestConfig, (error, body) => {
        if (error) {
            return callback(error, null);
        }
        try {
            const obj = JSON.parse(body);
            if ("result" in obj) {
                return callback(null, obj.result);
            }
            return callback(obj.error, null);
        } catch (error) {
            return callback(error, null);
        }
    });
}
