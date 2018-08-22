import chalk from "chalk";
import { ILogger } from "../interfaces/ILogger";

export class Logger implements ILogger {

    public debug(...params: any[]) {
        const msg = params.shift();
        const coloredMessage = chalk.blue(JSON.stringify(msg, null, 2));
        return console.debug(coloredMessage, ...params);
    }

    public error(...params: any[]) {
        const msg = params.shift();
        const coloredMessage = chalk.redBright(JSON.stringify(msg, null, 2));
        return console.error(coloredMessage, ...params);
    }

    public info(...params: any[]) {
        const msg = params.shift();
        const coloredMessage = chalk.gray(JSON.stringify(msg, null, 2));
        return console.info(coloredMessage, ...params);
    }

    public log(...params: any[]) {
        const msg = params.shift();
        return console.log(JSON.stringify(msg, null, 2), ...params);
    }

    public warn(...params: any[]) {
        const msg = params.shift();
        const coloredMessage = chalk.yellowBright(JSON.stringify(msg, null, 2));
        return console.warn(coloredMessage, ...params);
    }
}
