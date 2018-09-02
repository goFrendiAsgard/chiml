"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cache-require-paths");
const BRIGHT = "\x1b[1m";
const FG_BLUE = "\x1b[34m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
function writeMessage(writer, color, ...message) {
    const params = [].concat([color], message, [RESET_COLOR]);
    writer(...params);
}
class Logger {
    debug(...params) {
        return writeMessage(console.debug, BRIGHT + FG_CYAN, ...params);
    }
    error(...params) {
        return writeMessage(console.error, BRIGHT + FG_RED, ...params);
    }
    info(...params) {
        return writeMessage(console.info, BRIGHT + FG_BLUE, ...params);
    }
    log(...params) {
        return console.log(...params);
    }
    warn(...params) {
        return writeMessage(console.warn, BRIGHT + FG_YELLOW, ...params);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map