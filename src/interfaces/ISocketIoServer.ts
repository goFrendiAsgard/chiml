import * as SocketIO from "socket.io";
import {ISocketIoEventListener} from "./ISocketIoEventListener";

export interface ISocketIoServer extends SocketIO.Server {
    eventListeners: ISocketIoEventListener[];
    addEventListener: (config: ISocketIoEventListener) => void;
    addEventListeners: (configs: ISocketIoEventListener[]) => void;
    applyEventListeners: () => void;
}
