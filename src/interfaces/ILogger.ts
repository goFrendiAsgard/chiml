export interface ILogger {
    debug(...params: any[]);
    error(...params: any[]);
    info(...params: any[]);
    log(...params: any[]);
    warn(...params: any[]);
}
