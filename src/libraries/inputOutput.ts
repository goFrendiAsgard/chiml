import * as cacheRequirePaths from "cache-require-paths";
import {createInterface, ReadLine, ReadLineOptions} from "readline";

export function createPrompt(config: ReadLineOptions = {input: process.stdin, output: process.stderr}): any {
  return (textPrompt: string, callback): any => {
    const rl = createInterface(config);
    rl.question(textPrompt, (userInput) => {
      rl.close();
      try {
        callback(null, JSON.parse(userInput));
      } catch (error) {
        callback(null, userInput);
      }
    });
    return rl;
  };
}

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

export function print(...args: any[]): void {
  const callback = args.pop();
  callback(null, console.log(...args));
}
