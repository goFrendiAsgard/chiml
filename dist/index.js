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
const R = require("ramda");
const BRIGHT = "\x1b[1m";
// const FG_BLUE = "\x1b[34m";
// const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
// const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
const parallelN = R.curry(internalParallel);
const wrapCommandN = R.curry(internalWrapCommand);
const wrapNodebackN = R.curry(internalWrapNodeback);
const wrapSyncN = R.curry(internalWrapSync);
const parallel = parallelN(0);
const wrapCommand = wrapCommandN(0);
const wrapNodeback = wrapNodebackN(0);
const wrapSync = wrapSyncN(0);
exports.X = Object.assign({}, R, {
    convergeInput,
    declarative,
    parallel,
    parallelN,
    wrapCommand,
    wrapCommandN,
    wrapNodeback,
    wrapNodebackN,
    wrapSync,
    wrapSyncN,
});
function declarative(declarativeConfig) {
    const { definition, declaration, action } = declarativeConfig;
    const defaultAction = "<identity>";
    const realDefinition = Object.assign({}, exports.X, definition);
    const realDeclaration = Object.assign({ defaultAction }, declaration);
    const realAction = action || "defaultAction";
    const dictionary = Object.assign({}, definition);
    return (...args) => console.dir(args);
}
function convergeInput(fn) {
    function func(arr) {
        return fn(...arr);
    }
    return func;
}
function internalParallel(arity, fnList) {
    function func(...args) {
        const promises = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return R.curryN(arity, func);
}
function internalWrapSync(arity, fn) {
    function func(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(fn(...args));
        });
    }
    return R.curryN(arity, func);
}
function internalWrapCommand(arity, stringCommand) {
    function func(...args) {
        const composedStringCommand = getEchoPipedStringCommand(stringCommand, args);
        return runStringCommand(composedStringCommand);
    }
    return R.curryN(arity, func);
}
function internalWrapNodeback(arity, fn) {
    function func(...args) {
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
            if (newArgs.length < arity) {
                newArgs.push(undefined);
            }
            newArgs.push(callback);
            fn(...newArgs);
        });
    }
    return R.curryN(arity, func);
}
function runStringCommand(stringCommand, options) {
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(stringCommand, options, (error, stdout, stderr) => {
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
        const stdinListener = getNewStdinListener(subProcess);
        process.stdin.on("data", stdinListener);
        subProcess.stdin.on("end", () => {
            process.stdin.removeListener("data", stdinListener);
            process.stdin.end();
        });
        subProcess.stdin.on("error", (error) => console.error(error));
        process.stdin.on("error", (error) => console.error(error));
    });
}
function getEchoPipedStringCommand(strCmd, ins) {
    if (ins.length === 0) {
        return strCmd;
    }
    const echoes = ins.map((element) => "echo " + getDoubleQuotedString(String(element))).join(" && ");
    const commandWithParams = getStringCommandWithParams(strCmd, ins);
    const composedCommand = `(${echoes}) | ${commandWithParams}`;
    return composedCommand;
}
function getStringCommandWithParams(strCmd, ins) {
    // command has no templated parameters
    if (strCmd.match(/.*\$\{[0-9]+\}.*/g)) {
        // command has templated parameters (i.e: ${1}, ${2}, etc)
        let commandWithParams = strCmd;
        for (let i = 0; i < ins.length; i++) {
            const paramIndex = i + 1;
            commandWithParams = commandWithParams.replace(`$\{${paramIndex}}`, getDoubleQuotedString(String(ins[i])));
        }
        return commandWithParams;
    }
    const inputs = ins.map((element) => getDoubleQuotedString(String(element))).join(" ");
    return `${strCmd} ${inputs}`;
}
function getNewStdinListener(subProcess) {
    return (chunk) => subProcess.stdin.write(chunk);
}
function getDoubleQuotedString(str) {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
//# sourceMappingURL=index.js.map