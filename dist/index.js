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
/*********************************************************
 * placeHolder
 *********************************************************/
exports._ = { __isPlaceHolder: true };
/*********************************************************
 * wrap
 *********************************************************/
function wrap(cmdOrFunc) {
    return internalCurry(cmdOrFunc, 0, [], "left");
}
exports.wrap = wrap;
/*********************************************************
 * curryLeft & curry
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
/*********************************************************
 * map
 *********************************************************/
function map(funcOrCmd) {
    return internalMap(funcOrCmd);
}
exports.map = map;
/*********************************************************
 * filter
 *********************************************************/
function filter(funcOrCmd) {
    return internalFilter(funcOrCmd);
}
exports.filter = filter;
/*********************************************************
 * reduce
 *********************************************************/
function reduce(funcOrCmd) {
    return internalReduce(funcOrCmd);
}
exports.reduce = reduce;
/*********************************************************
 * pipe
 *********************************************************/
function pipe(...actions) {
    return callInternal(actions, internalPipe);
}
exports.pipe = pipe;
/*********************************************************
 * compose
 *********************************************************/
function compose(...actions) {
    return callInternal(actions, internalCompose);
}
exports.compose = compose;
/*********************************************************
 * parallel
 *********************************************************/
function parallel(...funcOrCmds) {
    return callInternal(funcOrCmds, internalParallel);
}
exports.parallel = parallel;
/*********************************************************
 * cond
 *********************************************************/
function condition(ifThens, arity) {
    return internalCondition(ifThens, arity);
}
exports.condition = condition;
/*********************************************************
 * add, subtract, multiply, divide, modulo, negate
 *********************************************************/
exports.add = exports.curry((n1, n2) => n1 + n2, 2);
exports.subtract = exports.curry((n1, n2) => n1 - n2, 2);
exports.multiply = exports.curry((n1, n2) => n1 * n2, 2);
exports.divide = exports.curry((n1, n2) => n1 / n2, 2);
exports.modulo = exports.curry((n1, n2) => n1 % n2, 2);
exports.negate = exports.curry((n) => -n, 1);
/*********************************************************
 * and, or, not
 *********************************************************/
exports.and = exports.curry((n1, n2) => n1 && n2, 2);
exports.or = exports.curry((n1, n2) => n1 || n2, 2);
exports.not = wrap((n) => !n);
/*********************************************************
 * eq, gt, gte, lt, lte, neq
 *********************************************************/
exports.eq = exports.curry((n1, n2) => n1 === n2, 2);
exports.gt = exports.curry((n1, n2) => n1 > n2, 2);
exports.gte = exports.curry((n1, n2) => n1 >= n2, 2);
exports.lt = exports.curry((n1, n2) => n1 < n2, 2);
exports.lte = exports.curry((n1, n2) => n1 <= n2, 2);
exports.neq = exports.curry((n1, n2) => n1 !== n2, 2);
/*********************************************************
 * T, F
 *********************************************************/
exports.F = wrap(() => false);
exports.T = wrap(() => true);
/*********************************************************
 * private functions
 *********************************************************/
function callInternal(funcOrCmds, internalFunction) {
    if (funcOrCmds.length === 2) {
        const [realFuncOrCmds, arity] = funcOrCmds;
        if (Array.isArray(realFuncOrCmds) && Number.isInteger(arity)) {
            return internalFunction(realFuncOrCmds, arity);
        }
    }
    return internalFunction(funcOrCmds, 0);
}
function isPlaceHolder(obj) {
    return typeof obj === "object" && obj && obj.__isPlaceHolder;
}
function isWrappedFunction(func) {
    return (typeof func === "object" || typeof func === "function") && "__isWrapped" in func;
}
function internalWrap(cmdOrFunc) {
    // if function is already wrapped, just return it without any modification
    if (isWrappedFunction(cmdOrFunc)) {
        return cmdOrFunc;
    }
    // Otherwise, create resolver and mark it as wrapped object
    let func;
    if (isPromise(cmdOrFunc)) {
        func = (() => cmdOrFunc);
    }
    else if (typeof cmdOrFunc === "string") {
        func = createCmdResolver(cmdOrFunc);
    }
    else if (typeof cmdOrFunc === "function") {
        func = createFunctionResolver(cmdOrFunc);
    }
    else {
        func = (() => Promise.resolve(cmdOrFunc));
    }
    func.__isWrapped = true;
    return func;
}
function internalCurry(fn, arity, memo, mode) {
    function curried(...args) {
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
        const isPlaceHolderFound = newArgs.length > 0 && newArgs.filter(isPlaceHolder).length > 0;
        // no placeholder found and newArgs's count is greater than arity
        if (!isPlaceHolderFound && (newArgs.length >= arity)) {
            if (mode !== "left") {
                newArgs = newArgs.reverse();
            }
            const realFn = internalWrap(fn);
            return realFn(...newArgs);
        }
        const newFn = internalCurry(fn, arity, newArgs, mode);
        newFn.__isWrapped = true;
        return newFn;
    }
    curried.__isWrapped = true;
    return curried;
}
function internalPipe(actions, arity) {
    function piped(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = Promise.resolve(null);
            for (let i = 0; i < actions.length; i++) {
                const action = internalWrap(actions[i]);
                if (i === 0) {
                    result = yield action(...args);
                    continue;
                }
                result = yield action(result);
            }
            return result;
        });
    }
    piped.__isWrapped = true;
    return internalCurry(piped, arity, [], "left");
}
function internalCompose(actions, arity) {
    return internalPipe(actions.reverse(), arity);
}
function internalMap(funcOrCmd) {
    function mapped(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const func = internalWrap(funcOrCmd);
            const promises = args.map((element) => __awaiter(this, void 0, void 0, function* () { return func(element); }));
            return Promise.all(promises);
        });
    }
    mapped.__isWrapped = true;
    return mapped;
}
function internalFilter(funcOrCmd) {
    function filtered(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const func = internalWrap(funcOrCmd);
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
    filtered.__isWrapped = true;
    return filtered;
}
function internalReduce(funcOrCmd) {
    function reduced(accumulator, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const func = internalWrap(funcOrCmd);
            let result = accumulator;
            for (const arg of args) {
                result = yield func(arg, result);
            }
            return result;
        });
    }
    reduced.__isWrapped = true;
    return internalCurry(reduced, 2, [], "left");
}
function internalParallel(funcOrCmds, arity) {
    function paralleled(...args) {
        const promises = funcOrCmds.map((funcOrCmd) => {
            if (isPromise(funcOrCmd)) {
                return funcOrCmd;
            }
            const func = internalWrap(funcOrCmd);
            return func(...args);
        });
        return Promise.all(promises);
    }
    paralleled.__isWrapped = true;
    return internalCurry(paralleled, arity, [], "left");
}
function internalCondition(ifThens, arity) {
    function conditioned(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const rawIfThen of ifThens) {
                const ifThen = rawIfThen.map(wrap);
                const [cond, action] = ifThen;
                const conditionResult = yield cond(...args);
                if (conditionResult) {
                    return yield action(...args);
                }
            }
            return null;
        });
    }
    conditioned.__isWrapped = true;
    return internalCurry(conditioned, arity, [], "left");
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