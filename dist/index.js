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
    }
    else {
        config.injection = { X: exports.X };
    }
    // get bootstrap and run it
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
    const parsedDict = declarativeConfig.injection;
    const componentNameList = Object.keys(componentDict);
    const globalState = {};
    // parse all `<key>`, create function, and register it to parsedDict
    componentNameList.forEach((componentName) => _addToParsedDict(parsedDict, globalState, componentDict, componentName));
    // return bootstrap function
    const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
    if (!parsedDictVal.found) {
        throw (new Error(`Bootstrap component \`${bootstrap}\` is not defined`));
    }
    return _getWrappedBootstrapFunction(bootstrap, componentDict, parsedDict, globalIns, globalOut, globalState);
}
function _getWrappedBootstrapFunction(bootstrap, componentDict, parsedDict, globalIns, globalOut, globalState) {
    function wrappedBootstrapFunction(...args) {
        if (globalIns !== null) {
            if (args.length < globalIns.length) {
                const error = new Error(`Program expecting ${globalIns.length} arguments, but ${args.length} given`);
                const structure = {
                    ins: globalIns,
                    out: globalOut,
                    bootstrap,
                };
                throw (_getEmbededError(error, "", globalState, structure));
            }
            args.forEach((value, index) => {
                const key = globalIns[index];
                globalState[key] = value;
            });
        }
        const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
        const func = parsedDictVal.value;
        const wrappedFunction = bootstrap in componentDict && parsedDictVal.found ?
            func : _getWrappedFunction(bootstrap, componentDict, func, globalIns, globalOut, globalState);
        const bootstrapOutput = wrappedFunction(...args);
        if (_isPromise(bootstrapOutput)) {
            if (globalOut === null) {
                return bootstrapOutput;
            }
            return bootstrapOutput.then((val) => globalState[globalOut]);
        }
        return globalOut === null ? bootstrapOutput : globalState[globalOut];
    }
    return wrappedBootstrapFunction;
}
function _getParsedParts(parsedDict, globalState, componentDict, parentComponentName, parts) {
    if (Array.isArray(parts)) {
        const newVals = parts.map((element) => _getParsedParts(parsedDict, globalState, componentDict, parentComponentName, element));
        return newVals;
    }
    if (typeof parts === "string") {
        const tagPattern = /^\s*\$\{(.+)\}\s*$/gi;
        const match = tagPattern.exec(parts);
        if (match) {
            const key = match[1];
            if (!(key in parsedDict) && (key in componentDict)) {
                _addToParsedDict(parsedDict, globalState, componentDict, key);
            }
            const parsedDictVal = _getFromParsedDict(parsedDict, key);
            if (parsedDictVal.found) {
                return parsedDictVal.value;
            }
            throw (new Error(`Error parsing \`${parentComponentName}\` component: ` +
                `Part \`${key}\` is not defined`));
        }
        return parts;
    }
    return parts;
}
function _getFromParsedDict(parsedDict, searchKey) {
    const searchKeyParts = searchKey.split(".");
    const result = {
        value: parsedDict,
        found: false,
    };
    for (const key of searchKeyParts) {
        if (key in result.value) {
            result.value = result.value[key];
            result.found = true;
            continue;
        }
        result.found = false;
    }
    return result;
}
function _addToParsedDict(parsedDict, globalState, componentDict, componentName) {
    componentDict[componentName] = _getCompleteComponent(componentDict[componentName]);
    const { ins, out, perform, parts } = componentDict[componentName];
    const parsedParts = _getParsedParts(parsedDict, globalState, componentDict, componentName, parts);
    try {
        const parsedDictVal = _getFromParsedDict(parsedDict, perform);
        const factory = parsedDictVal.value;
        if (typeof factory !== "function") {
            throw new Error(`${perform} is not a function`);
        }
        const func = _isEmptyArray(parsedParts) ? factory : factory(...parsedParts);
        if (typeof func !== "function") {
            const partsAsString = _getArgsStringRepresentation(parsedParts);
            throw new Error(`${perform}${partsAsString} is not a function`);
        }
        parsedDict[componentName] = _getWrappedFunction(componentName, componentDict, func, ins, out, globalState);
    }
    catch (error) {
        const structure = { component: {} };
        structure.component[componentName] = componentDict[componentName];
        throw (_getEmbededError(error, `Error parsing \`${componentName}\` component. \`${perform}\` yield error:`, globalState, structure));
    }
}
function _getArgsStringRepresentation(args) {
    return util_1.inspect(args).replace(/^\[/g, "(").replace(/\]$/g, ")");
}
function _getWrappedFunction(componentName, componentDict, func, ins, out, state) {
    function wrappedFunction(...args) {
        const realArgs = ins === null ? args : _getArrayFromObject(ins, state);
        try {
            const funcOut = func(...realArgs);
            if (_isPromise(funcOut)) {
                const funcOutWithErrorHandler = funcOut.catch((error) => {
                    const realArgsAsString = _getArgsStringRepresentation(realArgs);
                    const errorMessage = `Error executing \`${componentName}${realArgsAsString}\` async component:`;
                    const structure = { component: {} };
                    structure.component[componentName] = componentDict[componentName];
                    return Promise.reject(_getEmbededError(error, errorMessage, state, structure));
                });
                if (out === null) {
                    return funcOutWithErrorHandler;
                }
                return funcOutWithErrorHandler.then((val) => {
                    state[out] = val;
                    return val;
                });
            }
            if (out != null) {
                state[out] = funcOut;
            }
            return funcOut;
        }
        catch (error) {
            const realArgsAsString = _getArgsStringRepresentation(realArgs);
            const errorMessage = `Error executing \`${componentName}${realArgsAsString}\` component:`;
            const structure = { component: {} };
            structure.component[componentName] = componentDict[componentName];
            throw (_getEmbededError(error, errorMessage, state, structure));
        }
    }
    return wrappedFunction;
}
function _getArrayFromObject(keys, obj) {
    const arr = [];
    keys.forEach((key) => arr.push(obj[key]));
    return arr;
}
function _getEmbededError(error, message, state, structure) {
    if (typeof error !== "object" || !error.message) {
        error = new Error(error);
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
        const completeComponent = _getCompleteComponent(completeConfig.component[componentName]);
        completeConfig.component[componentName] = completeComponent;
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
    if (strCmd.match(/.*\$\{[0-9]+\}.*/g) || strCmd.match(/.*\$[0-9]+.*/g)) {
        // command contains `${number}`
        let commandWithParams = strCmd;
        ins.forEach((value, index) => {
            const paramIndex = index + 1;
            const patternWithCurlyBrace = `$\{${paramIndex}\}`;
            const patternWithoutCurlyBrace = `$${paramIndex}`;
            const replacement = _getDoubleQuotedString(String(value));
            commandWithParams = commandWithParams
                .replace(patternWithCurlyBrace, replacement)
                .replace(patternWithoutCurlyBrace, replacement);
        });
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