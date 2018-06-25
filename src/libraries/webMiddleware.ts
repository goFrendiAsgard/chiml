import * as koaRoute from "koa-route";

export function jsonRpc(path): (...ins: any[]) => any {
  return koaRoute.post(`${path}/:procedure`, (ctx, procedure) => {
    // TODO: map a json rpc response
    ctx.body = JSON.stringify({});
  });
}

export function xmlRpc(path): (...ins: any[]) => any {
  return koaRoute.post(`${path}/:procedure`, (ctx, procedure) => {
    // TODO: map a xml rpc response
    ctx.body = JSON.stringify({});
  });
}
