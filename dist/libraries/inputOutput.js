"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const Logger_1 = require("../classes/Logger");
const logger = new Logger_1.Logger();
function createPrompt(config = { input: process.stdin, output: process.stderr }) {
    return (textPrompt, callback) => {
        const rl = readline_1.createInterface(config);
        rl.question(textPrompt, (userInput) => {
            rl.close();
            try {
                callback(null, JSON.parse(userInput));
            }
            catch (error) {
                callback(null, userInput);
            }
        });
        return rl;
    };
}
exports.createPrompt = createPrompt;
function createPrint(config = { logger }) {
    return (...args) => {
        const callback = args.pop();
        callback(null, logger.log(...args));
    };
}
exports.createPrint = createPrint;
