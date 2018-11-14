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
// const BRIGHT = "\x1b[1m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
exports.X = Object.assign({}, R, {
    declarative,
    foldInput,
    spreadInput,
    parallel,
    wrapCommand,
    wrapNodeback,
    wrapSync,
});
/**
 * @param declarativeConfig IDeclarativeConfig
 */
function declarative(declarativeConfig) {
    const { component, bootstrap } = declarativeConfig;
    const dictionary = Object.assign({}, declarativeConfig.injection);
    const compKeys = Object.keys(component);
    // parse all `<key>`, create function, and register it to dictionary
    for (const key of compKeys) {
        const completeComponent = _getCompleteComponent(component[key]);
        component[key] = completeComponent;
        const { pipe, parts } = completeComponent;
        const parsedParts = _getParsedComponentParts(parts, dictionary);
        try {
            const fn = _getComponentFunction(completeComponent, dictionary);
            dictionary[key] = fn;
        }
        catch (error) {
            const parsedPartsString = JSON.stringify(parsedParts);
            error.message = `Error run ${pipe} ${parsedPartsString}: ${error.message}`;
            throw (error);
        }
    }
    if (bootstrap in dictionary) {
        return _getWrappedBootstrapFunction(component[bootstrap], dictionary[bootstrap]);
    }
    throw (new Error(`${bootstrap} is not defined`));
}
function _getWrappedBootstrapFunction(bootstrapComponent, bootstrapFunction) {
    function wrappedFunction(...args) {
        const { ins } = bootstrapComponent;
        if (!_isEmptyArray(ins)) {
            const state = {};
            for (let i = 0; i < args.length; i++) {
                const val = args[i];
                const key = ins[i];
                state[key] = val;
            }
            return bootstrapFunction(state);
        }
        return bootstrapFunction(...args);
    }
    return wrappedFunction;
}
function _getComponentFunction(component, dictionary) {
    const { ins, outs, pipe, parts } = component;
    const parsedParts = _getParsedComponentParts(parts, dictionary);
    const factory = dictionary[pipe];
    const fn = _isEmptyArray(parsedParts) ? factory : factory(...parsedParts);
    function wrappedFunction(...args) {
        let state = {};
        let inputs = [];
        if (!_isEmptyArray(ins)) {
            inputs = args;
        }
        else {
            state = args[0];
            inputs = ins.map((key) => state[key]);
        }
        const result = fn(...inputs);
        let output;
        if (!_isEmptyArray(outs)) {
            output = result;
        }
        else {
            output = _getOutput(state, outs, result);
        }
        console.error("TEST", { pipe, args, inputs, output });
        return output;
    }
    return wrappedFunction;
}
function _getOutput(state, outs, result) {
    if (_isArrayContainPromise(result)) {
        return Promise.all(result).then((vals) => _getPrimitiveOutput(state, outs, result));
    }
    return _getPrimitiveOutput(state, outs, result);
}
function _getPrimitiveOutput(state, outs, result) {
    const output = Object.assign({}, state, outs.map((key) => result[key]));
    return output;
}
function _getCompleteComponent(partialComponent) {
    const defaultComponent = {
        ins: [],
        outs: [],
        pipe: "Identity",
        parts: [],
    };
    return Object.assign({}, defaultComponent, partialComponent);
}
/**
 * @param parts any
 * @param dictionary object
 */
function _getParsedComponentParts(parts, dictionary) {
    if (Array.isArray(parts)) {
        const newVals = parts.map((element) => _getParsedComponentParts(element, dictionary));
        return newVals;
    }
    if (typeof parts === "string") {
        const tagPattern = /<(.+)>/gi;
        const match = tagPattern.exec(parts);
        if (match) {
            const key = match[1];
            if (key in dictionary) {
                return dictionary[key];
            }
            throw (new Error(`<${key}> is not found`));
        }
        return parts;
    }
    return parts;
}
/**
 * @param fn AnyFunction
 */
function spreadInput(fn) {
    function spreaded(...args) {
        return fn(args);
    }
    return spreaded;
}
/**
 * @param fn AnyFunction
 */
function foldInput(fn) {
    function folded(arr) {
        return fn(...arr);
    }
    return folded;
}
/**
 * @param fnList AnyAsynchronousFunction
 */
function parallel(...fnList) {
    function parallelPipe(...args) {
        const promises = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return parallelPipe;
}
/**
 * @param fn AnyFunction
 */
function wrapSync(fn) {
    function wrappedSync(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(fn(...args));
        });
    }
    return wrappedSync;
}
/**
 * @param fn AnyFunction
 */
function wrapNodeback(fn) {
    function wrappedNodeback(...args) {
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
            fn(...newArgs);
        });
    }
    return wrappedNodeback;
}
/**
 * @param stringCommand string
 */
function wrapCommand(stringCommand) {
    function wrappedCommand(...args) {
        const composedStringCommand = _getEchoPipedStringCommand(stringCommand, args);
        return _runStringCommand(composedStringCommand);
    }
    return wrappedCommand;
}
/**
 * @param strCmd string
 * @param ins any[]
 */
function _getEchoPipedStringCommand(strCmd, ins) {
    if (ins.length === 0) {
        return strCmd;
    }
    const echoes = ins.map((element) => "echo " + _getDoubleQuotedString(String(element))).join(" && ");
    const commandWithParams = _getStringCommandWithParams(strCmd, ins);
    const composedCommand = `(${echoes}) | ${commandWithParams}`;
    return composedCommand;
}
/**
 * @param stringCommand string
 * @param options object
 */
function _runStringCommand(stringCommand, options) {
    return new Promise((resolve, reject) => {
        // define subProcess
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
        // subProcess.stdout data listener
        subProcess.stdout.on("data", (chunk) => {
            process.stderr.write(FG_CYAN);
            process.stderr.write(String(chunk));
            process.stderr.write(RESET_COLOR);
        });
        // subProcess.stderr data listener
        subProcess.stderr.on("data", (chunk) => {
            process.stderr.write(FG_YELLOW);
            process.stderr.write(String(chunk));
            process.stderr.write(RESET_COLOR);
        });
        // subProcess.stdin data listener
        const stdinListener = (chunk) => subProcess.stdin.write(chunk);
        subProcess.stdin.on("data", stdinListener);
        subProcess.stdin.on("end", () => {
            process.stdin.removeListener("data", stdinListener);
            process.stdin.end();
        });
        // subProcess.stdin error listener
        const errorListener = (error) => {
            process.stderr.write(FG_RED);
            console.error(error);
            process.stderr.write(RESET_COLOR);
        };
        subProcess.stdin.on("error", errorListener);
        process.stdin.on("error", errorListener);
    });
}
/**
 * @param strCmd string
 * @param ins any[]
 */
function _getStringCommandWithParams(strCmd, ins) {
    // command has no templated parameters
    if (strCmd.match(/.*\$\{[0-9]+\}.*/g)) {
        // command has templated parameters (i.e: ${1}, ${2}, etc)
        let commandWithParams = strCmd;
        for (let i = 0; i < ins.length; i++) {
            const paramIndex = i + 1;
            commandWithParams = commandWithParams.replace(`$\{${paramIndex}}`, _getDoubleQuotedString(String(ins[i])));
        }
        return commandWithParams;
    }
    const inputs = ins.map((element) => _getDoubleQuotedString(String(element))).join(" ");
    return `${strCmd} ${inputs}`;
}
/**
 * @param str string
 */
function _getDoubleQuotedString(str) {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
/**
 * @param arr any[]
 */
function _isEmptyArray(arr) {
    if (Array.isArray(arr) && arr.length === 0) {
        return true;
    }
    return false;
}
/**
 * @param arr any[]
 */
function _isArrayContainPromise(arr) {
    if (Array.isArray(arr)) {
        for (const val of arr) {
            if (_isPromise(val)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * @param obj any
 */
function _isPromise(obj) {
    if (typeof obj === "object" && obj.then) {
        return true;
    }
    return false;
}
//# sourceMappingURL=index.js.map