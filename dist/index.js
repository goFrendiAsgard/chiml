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
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const R = require("ramda");
const util_1 = require("util");
const FG_BRIGHT = "\x1b[1m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
const TAG_PATTERN = /^\s*\$\{(.+)\}\s*$/gi;
exports.X = Object.assign({}, R, {
    declarative,
    execute,
    foldInput,
    spreadInput,
    concurrent,
    wrapCommand,
    wrapNodeback,
    wrapSync,
});
function execute(containerFile, injectionFile = null) {
    const yamlScript = fs_1.readFileSync(containerFile).toString();
    const config = js_yaml_1.safeLoad(yamlScript);
    // define config.injection
    if (injectionFile === null && config.injection && config.injection[0] === ".") {
        const dirname = path_1.resolve(path_1.dirname(containerFile));
        injectionFile = path_1.join(dirname, config.injection);
    }
    if (injectionFile) {
        config.injection = require(injectionFile);
        return exports.X.declarative(config);
    }
    config.injection = { X: exports.X };
    return exports.X.declarative(config);
}
exports.execute = execute;
/**
 * @param declarativeConfig IDeclarativeConfig
 */
function declarative(partialDeclarativeConfig) {
    const declarativeConfig = _getCompleteDeclarativeConfig(partialDeclarativeConfig);
    const componentDict = declarativeConfig.component;
    const globalIns = declarativeConfig.ins;
    const globalOut = declarativeConfig.out;
    const { bootstrap } = declarativeConfig;
    const componentNameList = Object.keys(componentDict);
    const state = {};
    // parse all `${key}`, create function, and register it to parsedDict
    const parsedDict = componentNameList.reduce((tmpParsedDict, componentName) => {
        return _addToParsedDict(tmpParsedDict, state, componentDict, componentName);
    }, declarativeConfig.injection);
    /*
    const parsedDict = declarativeConfig.injection;
    componentNameList.forEach(
        (componentName) => _addToParsedDict(parsedDict, state, componentDict, componentName),
    );
    */
    // return bootstrap function
    const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
    if (!parsedDictVal.found) {
        const error = new Error(`Bootstrap component \`${bootstrap}\` is not defined`);
        const structure = {
            ins: globalIns,
            out: globalOut,
            bootstrap,
        };
        throw (_getEmbededError(error, "", state, structure));
    }
    return _getWrappedBootstrapFunction(bootstrap, componentDict, parsedDict, globalIns, globalOut, state);
}
function _getWrappedBootstrapFunction(bootstrap, componentDict, parsedDict, globalIns, globalOut, state) {
    function wrappedBootstrapFunction(...args) {
        if (globalIns !== null) {
            if (args.length < globalIns.length) {
                const error = new Error(`Program expecting ${globalIns.length} arguments, but ${args.length} given`);
                const structure = {
                    ins: globalIns,
                    out: globalOut,
                    bootstrap,
                };
                throw (_getEmbededError(error, "", state, structure));
            }
            state = args.reduce((tmpState, arg, index) => {
                return _setState(tmpState, globalIns[index], arg);
            }, state);
        }
        const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
        const func = parsedDictVal.value;
        const wrappedFunction = bootstrap in componentDict && parsedDictVal.found ?
            func : _getWrappedFunction(bootstrap, componentDict, func, globalIns, globalOut, state);
        const bootstrapOutput = wrappedFunction(...args);
        if (_isPromise(bootstrapOutput)) {
            if (globalOut === null) {
                return bootstrapOutput;
            }
            return bootstrapOutput.then((val) => state[globalOut]);
        }
        return globalOut === null ? bootstrapOutput : state[globalOut];
    }
    return wrappedBootstrapFunction;
}
function _getParsedParts(parsedDict, state, componentDict, parentComponentName, parts) {
    if (Array.isArray(parts)) {
        const newVals = parts.map((element) => _getParsedParts(parsedDict, state, componentDict, parentComponentName, element));
        return newVals;
    }
    if (typeof parts === "string") {
        const tagPattern = new RegExp(TAG_PATTERN);
        const match = tagPattern.exec(parts);
        if (match) {
            const key = match[1];
            const parsedDictVal = _getFromParsedDict(parsedDict, key);
            return parsedDictVal.value;
        }
        parts = parts.replace(/^\s*\\\$\{(.+)\}\s*$/gi, "\${$1}");
        return parts;
    }
    return parts;
}
function _getFromParsedDict(parsedDict, searchKey) {
    const searchKeyParts = searchKey.split(".");
    const initialResult = {
        value: parsedDict,
        found: false,
    };
    return searchKeyParts.reduce((result, key) => {
        if (key in result.value) {
            result.value = result.value[key];
            result.found = true;
            return result;
        }
        result.found = false;
        return result;
    }, initialResult);
}
function _addToParsedDict(parsedDict, state, componentDict, componentName) {
    componentDict[componentName] = _getCompleteComponent(componentDict[componentName]);
    const { ins, out, perform, parts } = componentDict[componentName];
    try {
        const parsedDictVal = _getFromParsedDict(parsedDict, perform);
        const factory = parsedDictVal.value;
        if (typeof factory !== "function") {
            throw new Error(`\`${perform}\` is not a function`);
        }
        if (_isEmptyArray(parts)) {
            function nonComposedFunc(...args) {
                return factory(...args);
            }
            parsedDict[componentName] = _getWrappedFunction(componentName, componentDict, nonComposedFunc, ins, out, state);
            return parsedDict;
        }
        _checkComponentParts(parsedDict, componentDict, componentName);
        function composedFunc(...args) {
            const parsedParts = _getParsedParts(parsedDict, state, componentDict, componentName, parts);
            const internalFunction = factory(...parsedParts);
            if (typeof internalFunction !== "function") {
                const partsAsString = _getArgsStringRepresentation(parsedParts);
                throw new Error(`\`${perform}${partsAsString}\` is not a function`);
            }
            return factory(...parsedParts)(...args);
        }
        parsedDict[componentName] = _getWrappedFunction(componentName, componentDict, composedFunc, ins, out, state);
        return parsedDict;
    }
    catch (error) {
        throw (_getEmbededParsingError(error, state, componentName, componentDict));
    }
}
function _checkComponentParts(parsedDict, componentDict, componentName) {
    const { parts } = componentDict[componentName];
    parts.forEach((part) => {
        if (typeof part === "string") {
            const tagPattern = new RegExp(TAG_PATTERN);
            const match = tagPattern.exec(part);
            if (match) {
                const key = match[1];
                const { found } = _getFromParsedDict(parsedDict, key);
                if (!(key in componentDict) && !(found)) {
                    throw new Error(`Part \`${key}\` is not defined`);
                }
            }
        }
    });
}
function _getEmbededParsingError(error, state, componentName, componentDict) {
    const { perform } = componentDict[componentName];
    const structure = { component: {} };
    structure.component[componentName] = componentDict[componentName];
    return _getEmbededError(error, `Error parsing component \`${componentName}\`:`, state, structure);
}
function _getArgsStringRepresentation(args) {
    return util_1.inspect(args).replace(/^\[/g, "(").replace(/\]$/g, ")");
}
function _getWrappedFunction(componentName, componentDict, func, ins, out, state) {
    function wrappedFunction(...args) {
        const realArgs = ins === null ? args : _getArrayFromObject(ins, state);
        const realArgsAsString = _getArgsStringRepresentation(realArgs);
        try {
            const funcOut = func(...realArgs);
            if (_isPromise(funcOut)) {
                const funcOutWithErrorHandler = funcOut.catch((error) => {
                    return Promise.reject(_getEmbededExecutionError(error, state, componentName, componentDict, realArgs));
                });
                if (out === null) {
                    return funcOutWithErrorHandler;
                }
                return funcOutWithErrorHandler.then((val) => {
                    _setState(state, out, val);
                    return val;
                });
            }
            if (out != null) {
                _setState(state, out, funcOut);
            }
            return funcOut;
        }
        catch (error) {
            throw (_getEmbededExecutionError(error, state, componentName, componentDict, realArgs));
        }
    }
    return wrappedFunction;
}
function _getEmbededExecutionError(error, state, componentName, componentDict, args) {
    const realArgsAsString = _getArgsStringRepresentation(args);
    const errorMessage = `Error executing component \`${componentName}${realArgsAsString}\`:`;
    const structure = { component: {} };
    structure.component[componentName] = componentDict[componentName];
    return _getEmbededError(error, errorMessage, state, structure);
}
function _setState(state, key, value) {
    if (key in state) {
        throw (new Error(`Cannot reassign \`${key}\``));
    }
    state[key] = _freeze(value);
    return state;
}
function _freeze(value) {
    if (typeof value === "object" || Array.isArray(value)) {
        if (Object.isFrozen(value)) {
            return value;
        }
        Object.freeze(value);
        const keys = Object.keys(value);
        keys.forEach((key) => {
            _freeze(value[key]);
        });
    }
    return value;
}
function _getArrayFromObject(keys, obj) {
    return keys.map((key) => obj[key]);
}
function _getEmbededError(error, message, state, structure) {
    if (typeof error !== "object" || !error.message) {
        error = new Error(error);
    }
    if (error.message.indexOf("ERROR: ") > -1) {
        return error;
    }
    const newErrorMessage = message === "" ? error.message : `${message} ${error.message}`;
    const stateString = JSON.stringify(state, null, 2);
    const structureString = JSON.stringify(structure, null, 2)
        .replace(/\n(\s*)}/gi, "\n$1  ...\n$1}");
    error.message = `\n${FG_BRIGHT}` +
        `${FG_RED}ERROR: ${newErrorMessage}\n` +
        `${FG_CYAN}STATE: ${stateString}\n` +
        `${FG_YELLOW}STRUCTURE: ${structureString}${RESET_COLOR}\n`;
    return error;
}
function _getCompleteDeclarativeConfig(partialConfig) {
    const defaultDeclarativeConfig = {
        ins: null,
        out: null,
        injection: {},
        component: {},
        bootstrap: "main",
    };
    const completeConfig = Object.assign({}, defaultDeclarativeConfig, partialConfig);
    // make sure `completeConfig.ins` is either null or an array. Otherwise, turn it into an array
    if (completeConfig.ins !== null && !Array.isArray(completeConfig.ins)) {
        completeConfig.ins = [completeConfig.ins];
    }
    // complete all component in `completeConfig.component`
    Object.keys(completeConfig.component).forEach((componentName) => {
        completeConfig.component[componentName] = _getCompleteComponent(completeConfig.component[componentName]);
    });
    return completeConfig;
}
function _getCompleteComponent(partialComponent) {
    const defaultComponent = {
        ins: null,
        out: null,
        perform: null,
        parts: [],
    };
    const component = Object.assign({}, defaultComponent, partialComponent);
    // make sure `component.ins` is either null or an array. Otherwise, turn it into an array
    if (component.ins !== null && !Array.isArray(component.ins)) {
        component.ins = [component.ins];
    }
    // make sure `component.parts` is an array. Otherwise, turn it into an array
    if (!Array.isArray(component.parts)) {
        component.parts = [component.parts];
    }
    return component;
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
function concurrent(...fnList) {
    function concurrentAction(...args) {
        const promises = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return concurrentAction;
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
    });
}
/**
 * @param strCmd string
 * @param ins any[]
 */
function _getStringCommandWithParams(strCmd, ins) {
    const pattern = /([^\\])\$[\{]?([0-9]+)[\}]?/g;
    if (strCmd.match(pattern)) {
        return strCmd.replace(pattern, (match, notBackSlash, paramIndex) => {
            const insIndex = paramIndex - 1;
            if (insIndex < ins.length) {
                const replacement = _getDoubleQuotedString(String(ins[insIndex]));
                return notBackSlash + replacement;
            }
            return "";
        });
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