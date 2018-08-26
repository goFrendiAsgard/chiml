import chalk from "chalk";
import { ILogger } from "../interfaces/ILogger";

const BRIGHT = "\x1b[1m";
const FG_BLUE = "\x1b[34m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";

function writeMessage(writer: (...params: any[]) => any, color: string, ...message: any[]): void {
    const params: any[] = [].concat([color], message, [RESET_COLOR]);
    writer(...params);
}

export class Logger implements ILogger {

    public debug(...params: any[]) {
        return writeMessage(console.debug, BRIGHT + FG_CYAN, ...params);
    }

    public error(...params: any[]) {
        return writeMessage(console.error, BRIGHT + FG_RED, ...params);
    }

    public info(...params: any[]) {
        return writeMessage(console.info, BRIGHT + FG_BLUE, ...params);
    }

    public log(...params: any[]) {
        return console.log(...params);
    }

    public warn(...params: any[]) {
        return writeMessage(console.warn, BRIGHT + FG_YELLOW, ...params);
    }
}
