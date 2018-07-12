"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
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
/*
export function prompt(textPrompt: string, callback): any {
  const rl = createInterface({
    input: process.stdin,
    output: process.stderr,
  });
  rl.question(textPrompt, (userInput) => {
    rl.close();
    try {
      callback(null, JSON.parse(userInput));
    } catch (error) {
      callback(null, userInput);
    }
  });
  return rl;
}
*/
function print(...args) {
    const callback = args.pop();
    callback(null, console.log(...args));
}
exports.print = print;
//# sourceMappingURL=inputOutput.js.map