"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
function prompt(textPrompt, callback) {
    const rl = readline_1.createInterface({
        input: process.stdin,
        output: process.stderr,
    });
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
}
exports.prompt = prompt;
function print(...args) {
    const callback = args.pop();
    callback(null, console.log(...args));
}
exports.print = print;
//# sourceMappingURL=inputOutput.js.map