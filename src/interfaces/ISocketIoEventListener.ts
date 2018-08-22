import { ILogger } from "./ILogger";

export interface ISocketIoEventListener {
    controller: any;
    event: string;
    logger?: ILogger;
}
