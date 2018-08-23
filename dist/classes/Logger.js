"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
class Logger {
    debug(...params) {
        const msg = params.shift();
        const coloredMessage = chalk_1.default.blue(JSON.stringify(msg, null, 2));
        return console.debug(coloredMessage, ...params);
    }
    error(...params) {
        const msg = params.shift();
        const coloredMessage = chalk_1.default.redBright(JSON.stringify(msg, null, 2));
        return console.error(coloredMessage, ...params);
    }
    info(...params) {
        const msg = params.shift();
        const coloredMessage = chalk_1.default.gray(JSON.stringify(msg, null, 2));
        return console.info(coloredMessage, ...params);
    }
    log(...params) {
        const msg = params.shift();
        return console.log(JSON.stringify(msg, null, 2), ...params);
    }
    warn(...params) {
        const msg = params.shift();
        const coloredMessage = chalk_1.default.yellowBright(JSON.stringify(msg, null, 2));
        return console.warn(coloredMessage, ...params);
    }
}
exports.Logger = Logger;
