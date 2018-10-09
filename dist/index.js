"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BRIGHT = "\x1b[1m";
const FG_BLUE = "\x1b[34m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
function chiml(...args) {
    const arg = args[0];
    const restArgs = args.slice(1);
    if (isAllPromise(args)) {
        if (args.length === 1) {
            // args only contain a single promise, return it
            return arg;
        }
        // Every element in `args` is Promise, do Promise.all
        return Promise.all(args);
    }
    if (Array.isArray(arg)) {
        return compose(arg, ...restArgs);
    }
    // create resolver and execute the resolver
    try {
        const result = resolveCmdOrFunction(arg, ...restArgs);
        if (isPromise(result)) {
            return result;
        }
        return Promise.resolve(result);
    }
    catch (error) {
        return Promise.reject(error);
    }
}
exports.chiml = chiml;
function compose(rawActions, ...args) {
    const actions = rawActions.reverse();
    let result = Promise.resolve(null);
    for (let i = 0; i < args.length; i++) {
        const action = actions[i];
        if (i === 0) {
            result = chiml(action, ...args);
            continue;
        }
        result = result.then((arg) => chiml(action, arg));
    }
    return result;
}
function resolveCmdOrFunction(func, ...args) {
    if (typeof func === "string") {
        const command = composeCommand(func, args);
        return runCommand(command);
    }
    if (typeof func === "function") {
        return resolveFunction(func, ...args);
    }
}
function resolveFunction(func, ...args) {
    return new Promise((resolve, reject) => {
        function callback(error, ...result) {
            if (error) {
                return reject(error);
            }
            if (result.length === 1) {
                return resolve(result[0]);
            }
            return resolve(result);
        }
        args.push(callback);
        try {
            const functionResult = func(...args);
            if (isPromise(functionResult)) {
                functionResult.then(resolve).catch(reject);
            }
            else if (typeof functionResult !== "undefined") {
                resolve(functionResult);
            }
        }
        catch (error) {
            reject(error);
        }
    });
}
function isAllPromise(args) {
    for (const arg of args) {
        if (!isPromise(arg)) {
            return false;
        }
    }
    return true;
}
/**
 * @param arg
 * @description return boolean value representing whether the `arg` is a `Promise` or not
 */
function isPromise(arg) {
    return arg && arg.then ? true : false;
}
function runCommand(command, options) {
    const logger = options && options.logger || console;
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            return resolve(stdout);
        });
        subProcess.stdout.on("data", (chunk) => {
            process.stderr.write(BRIGHT + FG_YELLOW);
            process.stderr.write(String(chunk));
            process.stderr.write(RESET_COLOR);
        });
        subProcess.stderr.on("data", (chunk) => {
            process.stderr.write(BRIGHT + FG_RED);
            process.stderr.write(String(chunk));
            process.stderr.write(RESET_COLOR);
        });
        const stdinListener = createStdInListener(subProcess);
        process.stdin.on("data", stdinListener);
        subProcess.stdin.on("end", () => {
            process.stdin.removeListener("data", stdinListener);
            process.stdin.end();
        });
        subProcess.stdin.on("error", (error) => logger.error(error));
        process.stdin.on("error", (error) => logger.error(error));
    });
}
function composeCommand(command, ins = []) {
    if (ins.length === 0) {
        return command;
    }
    const echoes = ins.map((element) => "echo " + doubleQuote(String(element))).join(" && ");
    const inputs = ins.map((element) => doubleQuote(String(element))).join(" ");
    const composedCommand = `(${echoes}) | ${command} ${inputs}`;
    return composedCommand;
}
function createStdInListener(subProcess) {
    return (chunk) => subProcess.stdin.write(chunk);
}
function doubleQuote(str) {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
//# sourceMappingURL=index.js.map