import * as cacheRequirePaths from "cache-require-paths";
import {createInterface} from "readline";

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

export function print(...args: any[]): void {
  const callback = args.pop();
  callback(null, console.log(...args));
}
