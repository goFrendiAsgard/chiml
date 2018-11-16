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
function declarative(partialDeclarativeConfig) {
    const declarativeConfig = getCompleteDeclarativeConfig(partialDeclarativeConfig);
    const componentDict = declarativeConfig.component;
    const globalIns = declarativeConfig.ins;
    const globalOut = declarativeConfig.out;
    const { bootstrap } = declarativeConfig;
    const parsedDict = Object.assign({}, declarativeConfig.injection);
    const componentNameList = Object.keys(componentDict);
    const globalState = {};
    // parse all `<key>`, create function, and register it to dictionary
    for (const componentName of componentNameList) {
        addToParsedDict(componentName);
    }
    // return bootstrap function
    if (bootstrap in parsedDict) {
        function wrappedBootstrapFunction(...args) {
            for (let i = 0; i < globalIns.length; i++) {
                const key = globalIns[i];
                globalState[key] = args[i];
            }
            const bootstrapOutput = parsedDict[bootstrap](...args);
            if (_isPromise(bootstrapOutput)) {
                return bootstrapOutput.then((val) => globalState[globalOut]);
            }
            return globalState[globalOut];
        }
        return wrappedBootstrapFunction;
    }
    throw (new Error(`${bootstrap} is not defined`));
    function getCompleteDeclarativeConfig(partialConfig) {
        const defaultDeclarativeConfig = {
            ins: [],
            out: "_",
            injection: {},
            component: {},
            bootstrap: "main",
        };
        const completeConfig = Object.assign({}, defaultDeclarativeConfig, partialConfig);
        if (!Array.isArray(completeConfig.ins)) {
            completeConfig.ins = [completeConfig.ins];
        }
        for (const componentName of Object.keys(completeConfig)) {
            const completeComponent = getCompleteComponent(completeConfig.component[componentName]);
            completeConfig.component[componentName] = completeComponent;
        }
        return completeConfig;
    }
    function getCompleteComponent(partialComponent) {
        const defaultComponent = {
            ins: ["_"],
            out: "_",
            pipe: "Identity",
            parts: [],
        };
        const component = Object.assign({}, defaultComponent, partialComponent);
        if (!Array.isArray(component.ins)) {
            component.ins = [component.ins];
        }
        if (!Array.isArray(component.parts)) {
            component.parts = [component.parts];
        }
        return component;
    }
    function getArrayFromState(keys) {
        const arr = [];
        for (const key of keys) {
            arr.push(globalState[key]);
        }
        return arr;
    }
    function getWrappedFunction(func, ins, out) {
        function wrappedFunction(...args) {
            const realArgs = getArrayFromState(ins);
            const funcOut = func(...realArgs);
            if (_isPromise(funcOut)) {
                return funcOut.then((val) => {
                    globalState[out] = val;
                });
            }
            globalState[out] = funcOut;
            return funcOut;
        }
        return wrappedFunction;
    }
    function addToParsedDict(componentName) {
        componentDict[componentName] = getCompleteComponent(componentDict[componentName]);
        const { ins, out, pipe, parts } = componentDict[componentName];
        const parsedParts = getParsedComponents(parts);
        try {
            const factory = parsedDict[pipe];
            const func = _isEmptyArray(parsedParts) ? factory : factory(...parsedParts);
            parsedDict[componentName] = getWrappedFunction(func, ins, out);
        }
        catch (error) {
            const parsedPartsString = JSON.stringify(parsedParts);
            error.message = `Error run ${pipe} ${parsedPartsString}: ${error.message}`;
            throw (error);
        }
    }
    function getParsedComponents(parts) {
        if (Array.isArray(parts)) {
            const newVals = parts.map((element) => getParsedComponents(element));
            return newVals;
        }
        if (typeof parts === "string") {
            const tagPattern = /<(.+)>/gi;
            const match = tagPattern.exec(parts);
            if (match) {
                const key = match[1];
                if (!(key in parsedDict) && (key in componentDict)) {
                    addToParsedDict(key);
                }
                if (key in parsedDict) {
                    return parsedDict[key];
                }
                throw (new Error(`<${key}> is not found`));
            }
            return parts;
        }
        return parts;
    }
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
                return resolve(stdout.replace(/\s+$/, ""));
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
 * @param obj any
 */
function _isPromise(obj) {
    if (typeof obj === "object" && obj.then) {
        return true;
    }
    return false;
}
//# sourceMappingURL=index.js.map