export interface ILogger {
    debug(...params: any[]): any;
    error(...params: any[]): any;
    info(...params: any[]): any;
    log(...params: any[]): any;
    warn(...params: any[]): any;
}
