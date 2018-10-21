"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BRIGHT = "\x1b[1m";
// const FG_BLUE = "\x1b[34m";
// const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
// const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
// real implementation
function wrap(arg) {
    if ((typeof arg === "object" || typeof arg === "function") && "__dontWrap" in arg) {
        return arg;
    }
    if (isPromise(arg)) {
        return markAsDontWrap(() => arg);
    }
    return markAsDontWrap(createCmdOrFunctionResolver(arg));
}
exports.wrap = wrap;
/*********************************************************
 * pipe
 *********************************************************/
function internalPipe(...actions) {
    function piped(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = Promise.resolve(null);
            for (let i = 0; i < actions.length; i++) {
                const action = wrap(actions[i]);
                if (i === 0) {
                    result = yield action(...args);
                    continue;
                }
                result = yield action(result);
            }
            return result;
        });
    }
    return markAsDontWrap(piped);
}
function pipe(...actions) {
    return internalPipe(...actions);
}
exports.pipe = pipe;
/*********************************************************
 * compose
 *********************************************************/
function compose(...actions) {
    const newActions = actions.reverse();
    return pipe(...newActions);
}
exports.compose = compose;
/*********************************************************
 * placeHolder
 *********************************************************/
exports.placeHolder = { isPlaceHolder: true };
/*********************************************************
 * curryLeft
 *********************************************************/
function curryLeft(fn, arity) {
    return internalCurry(fn, arity, [], "left");
}
exports.curryLeft = curryLeft;
exports.curry = curryLeft;
/*********************************************************
 * curryRight
 *********************************************************/
function curryRight(fn, arity) {
    return internalCurry(fn, arity, [], "right");
}
exports.curryRight = curryRight;
function internalCurry(fn, arity, memo, mode) {
    return (...args) => {
        let argIndex = 0;
        // newArgs is memo with all placeHolder replaced by args's element
        let newArgs = memo.map((arg) => {
            if (isPlaceHolder(arg) && argIndex < args.length) {
                const val = args[argIndex];
                argIndex++;
                return val;
            }
            return arg;
        });
        for (let i = argIndex; i < args.length; i++) {
            newArgs.push(args[i]);
        }
        const isPlaceHolderFound = newArgs.filter(isPlaceHolder).length > 0;
        // no placeholder found and newArgs's count is greater than arity
        if (!isPlaceHolderFound && (newArgs.length >= arity)) {
            if (mode !== "left") {
                newArgs = newArgs.reverse();
            }
            const newFn = wrap(fn);
            return newFn(...newArgs);
        }
        return internalCurry(fn, arity, newArgs, mode);
    };
}
// real implementation
function map(funcOrCmd) {
    function mapped(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const func = wrap(funcOrCmd);
            const promises = args.map((element) => __awaiter(this, void 0, void 0, function* () { return func(element); }));
            return Promise.all(promises);
        });
    }
    return markAsDontWrap(mapped);
}
exports.map = map;
// real implementation
function filter(funcOrCmd) {
    function filtered(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const func = wrap(funcOrCmd);
            const promises = args.map((element) => func(element));
            return Promise.all(promises)
                .then((filteredList) => {
                const result = [];
                for (let i = 0; i < filteredList.length; i++) {
                    if (filteredList[i]) {
                        result.push(args[i]);
                    }
                }
                return result;
            });
        });
    }
    return markAsDontWrap(filtered);
}
exports.filter = filter;
// real implementation
function reduce(funcOrCmd) {
    function reduced(accumulator, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const func = wrap(funcOrCmd);
            let result = accumulator;
            for (const arg of args) {
                result = yield func(arg, result);
            }
            return result;
        });
    }
    return markAsDontWrap(reduced);
}
exports.reduce = reduce;
/*********************************************************
 * parallel
 *********************************************************/
function parallel(...actions) {
    return markAsDontWrap(() => Promise.all(actions));
}
exports.parallel = parallel;
/*********************************************************
 * private functions
 *********************************************************/
function createCmdOrFunctionResolver(cmdOrFunc) {
    if (typeof cmdOrFunc === "string") {
        return createCmdResolver(cmdOrFunc);
    }
    return createFunctionResolver(cmdOrFunc);
}
function createCmdResolver(cmd) {
    return (...args) => {
        const command = composeCommand(cmd, args);
        return runCommand(command);
    };
}
function createFunctionResolver(func) {
    return (...args) => {
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
            const newArgs = Array.from(args);
            newArgs.push(callback);
            try {
                const functionResult = func(...newArgs);
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
    };
}
function markAsDontWrap(func) {
    func.__dontWrap = true;
    return func;
}
function isPlaceHolder(obj) {
    return typeof obj === "object" && obj && obj.isPlaceHolder;
}
/**
 * @param arg
 * @description return boolean value representing whether the `arg` is a `Promise` or not
 */
function isPromise(arg) {
    return arg && arg.then ? true : false;
}
function runCommand(command, options) {
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            try {
                return resolve(JSON.parse(stdout));
            }
            catch (error) {
                return resolve(stdout.trim());
            }
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
        subProcess.stdin.on("error", (error) => console.error(error));
        process.stdin.on("error", (error) => console.error(error));
    });
}
function composeCommand(command, ins) {
    if (ins.length === 0) {
        return command;
    }
    const echoes = ins.map((element) => "echo " + doubleQuote(String(element))).join(" && ");
    const commandWithParams = getCommandWithParams(command, ins);
    const composedCommand = `(${echoes}) | ${commandWithParams}`;
    return composedCommand;
}
function getCommandWithParams(command, ins) {
    // command has no templated parameters
    if (command.match(/.*\$\{[0-9]+\}.*/g)) {
        // command has templated parameters (i.e: ${1}, ${2}, etc)
        let commandWithParams = command;
        for (let i = 0; i < ins.length; i++) {
            const paramIndex = i + 1;
            commandWithParams = commandWithParams.replace(`$\{${paramIndex}}`, doubleQuote(String(ins[i])));
        }
        return commandWithParams;
    }
    const inputs = ins.map((element) => doubleQuote(String(element))).join(" ");
    return `${command} ${inputs}`;
}
function createStdInListener(subProcess) {
    return (chunk) => subProcess.stdin.write(chunk);
}
function doubleQuote(str) {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
//# sourceMappingURL=index.js.map