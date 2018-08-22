import * as Koa from "koa";
import * as socketIo from "socket.io";

export interface ISocketIoInjectedSocket extends socketIo.Socket {
    ctx: Koa.Context;
}
