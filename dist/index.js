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
const immutable_1 = require("immutable");
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
    // return bootstrap function
    const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
    if (!parsedDictVal.found) {
        const error = new Error(`Parse error, bootstrap component \`${bootstrap}\` is not defined`);
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
            const structure = { ins: globalIns, out: globalOut, bootstrap };
            const argsStringRepresentation = _getArgsStringRepresentation(args);
            const embededErrorMessage = `Runtime error, \`${bootstrap}${argsStringRepresentation}\`:`;
            if (args.length < globalIns.length) {
                const error = new Error(`Program expecting ${globalIns.length} arguments, but ${args.length} given`);
                throw (_getEmbededError(error, embededErrorMessage, state, structure));
            }
            try {
                state = args.reduce((tmpState, arg, index) => {
                    return _setState(tmpState, globalIns[index], arg);
                }, state);
            }
            catch (error) {
                throw (_getEmbededError(error, embededErrorMessage, state, structure));
            }
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
            return bootstrapOutput.then((val) => _getFromMaybeImmutable(state[globalOut]));
        }
        return globalOut === null ? bootstrapOutput : _getFromMaybeImmutable(state[globalOut]);
    }
    return wrappedBootstrapFunction;
}
function _getParsedParts(parsedDict, state, componentDict, parentComponentName, parts) {
    if (Array.isArray(parts)) {
        return parts.map((element) => _getParsedParts(parsedDict, state, componentDict, parentComponentName, element));
    }
    if (typeof parts === "object") {
        return Object.keys(parts).reduce((newObj, key) => {
            const val = parts[key];
            return Object.assign({}, newObj, {
                [key]: _getParsedParts(parsedDict, state, componentDict, parentComponentName, val),
            });
        }, {});
    }
    if (typeof parts === "string") {
        const tagPattern = new RegExp(TAG_PATTERN);
        const match = tagPattern.exec(parts);
        if (match) {
            // parse `${value}` template
            const key = match[1];
            const parsedDictVal = _getFromParsedDict(parsedDict, key);
            return parsedDictVal.value;
        }
        // un-escape `\${value}` into `${value}`
        return parts.replace(/^\s*\\\$\{(.+)\}\s*$/gi, "\${$1}");
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
            return Object.assign({}, result, { found: true, value: result.value[key] });
        }
        return Object.assign({}, result, { found: false });
    }, initialResult);
}
function _addToParsedDict(parsedDict, state, componentDict, componentName) {
    componentDict[componentName] = _getCompleteComponent(componentDict[componentName]);
    const { ins, out, perform, parts } = componentDict[componentName];
    try {
        const parsedDictVal = _getFromParsedDict(parsedDict, perform);
        const performer = parsedDictVal.value;
        if (typeof performer !== "function") {
            throw new Error(`\`${perform}\` is not a function`);
        }
        if (_isEmptyArray(parts)) {
            function nonComposedFunc(...args) {
                return performer(...args);
            }
            parsedDict[componentName] = _getWrappedFunction(componentName, componentDict, nonComposedFunc, ins, out, state);
            return parsedDict;
        }
        _checkComponentParts(parsedDict, componentDict, componentName);
        function composedFunc(...args) {
            const parsedParts = _getParsedParts(parsedDict, state, componentDict, componentName, parts);
            const performerPlusParts = performer(...parsedParts);
            const realFunction = typeof performerPlusParts === "function" ?
                performerPlusParts : () => performerPlusParts;
            return realFunction(...args);
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
    return parts.reduce((done, part) => {
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
    }, true);
}
function _getEmbededParsingError(error, state, componentName, componentDict) {
    const { perform } = componentDict[componentName];
    const structure = { component: { [componentName]: componentDict[componentName] } };
    return _getEmbededError(error, `Parse error, component \`${componentName}\`:`, state, structure);
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
    const errorMessage = `Runtime error, component \`${componentName}${realArgsAsString}\`:`;
    const structure = { component: { [componentName]: componentDict[componentName] } };
    return _getEmbededError(error, errorMessage, state, structure);
}
function _setState(state, key, value) {
    if (key in state) {
        throw (new Error(`Cannot reassign \`${key}\``));
    }
    state[key] = immutable_1.fromJS(value);
    return state;
}
function _getFromMaybeImmutable(val) {
    if (typeof val === "object" && typeof val.toJS === "function") {
        return val.toJS();
    }
    return val;
}
function _getArrayFromObject(keys, obj) {
    return keys.map((key) => _getFromMaybeImmutable(obj[key]));
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
    const filledConfig = Object.assign({}, defaultDeclarativeConfig, partialConfig);
    // make sure `ins` is either null or array. Otherwise, turn it into array
    const ins = filledConfig.ins !== null && !Array.isArray(filledConfig.ins) ? [filledConfig.ins] : filledConfig.ins;
    // get complete component
    const componentNameList = Object.keys(filledConfig.component);
    const component = componentNameList.reduce((tmpComponent, componentName) => {
        return Object.assign({}, tmpComponent, {
            [componentName]: _getCompleteComponent(filledConfig.component[componentName]),
        });
    }, {});
    // return complete config
    return Object.assign({}, filledConfig, { component, ins });
}
function _getCompleteComponent(partialComponent) {
    const defaultComponent = {
        ins: null,
        out: null,
        perform: null,
        parts: [],
    };
    const filledComponent = Object.assign({}, defaultComponent, partialComponent);
    // make sure `ins` is either null or an array. Otherwise, turn it into an array
    const ins = filledComponent.ins !== null && !Array.isArray(filledComponent.ins) ?
        [filledComponent.ins] : filledComponent.ins;
    // make sure `parts` is an array. Otherwise, turn it into an array
    const parts = Array.isArray(filledComponent.parts) ? filledComponent.parts : [filledComponent.parts];
    // return component component
    return Object.assign({}, filledComponent, { ins, parts });
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