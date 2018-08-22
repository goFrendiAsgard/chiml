import { ILogger } from "../interfaces/ILogger";
export declare class Logger implements ILogger {
    debug(...params: any[]): void;
    error(...params: any[]): void;
    info(...params: any[]): void;
    log(...params: any[]): void;
    warn(...params: any[]): void;
}
