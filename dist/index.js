"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const Ramda = require("ramda");
const util_1 = require("util");
const { createRequireFromPath } = require("module");
const FG_BRIGHT = "\x1b[1m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
const TAG_PATTERN = /^\s*\$\{(.+)\}\s*$/gi;
const SHORT_TAG_PATTERN = /^\s*\$([a-z0-9_\-\.]+)\s*$/gi;
exports.R = Ramda;
exports.X = {
    invoker,
    fluent,
    initAndFluent,
    concurrent,
    wrapCommand,
    wrapNodeback,
};
function inject(containerFile, userInjectionFile = null) {
    try {
        const dirname = path_1.resolve(path_1.dirname(containerFile));
        const relativeRequire = createRequireFromPath(containerFile);
        const yamlScript = fs_1.readFileSync(containerFile).toString();
        const config = js_yaml_1.safeLoad(yamlScript);
        const rawInjectionFileList = _getInjectionFileAndAliasList(config, userInjectionFile);
        const injection = rawInjectionFileList
            .reduce((tmpInjection, injectionFileAndAlias) => {
            const [injectionFile, alias] = _splitInjectionFileAndAlias(injectionFileAndAlias)
                .map((part) => part.trim());
            const obj = relativeRequire(injectionFile);
            return Object.assign({}, tmpInjection, { [alias]: obj });
        }, {});
        return declare(Object.assign({}, config, { injection }));
    }
    catch (error) {
        error.message = `CONTAINER FILE: ${containerFile}\n${error.message}`;
        throw (error);
    }
}
exports.inject = inject;
function _splitInjectionFileAndAlias(injectionFileAndAlias) {
    // Get alias from file name by using `as` or `:` separator
    // e.g:
    //  - `/home/kalimdor/warchief.thrall.js:wolfRider` --> ['wolfRider', '/home/kalimdor/warchief.thrall.js']
    //  - `/home/kalimdor/warchief.thrall.js as shaman` --> ['shaman', '/home/kalimdor/warchief.thrall.js']
    const fileAndAlias = [" as ", ":"].reduce((result, separator) => {
        if (result.length !== 2) {
            const splitted = injectionFileAndAlias.split(separator);
            if (splitted.length <= 2) {
                return splitted;
            }
            const aliasPart = splitted.pop();
            const fileNamePart = splitted.join(separator);
            return [fileNamePart, aliasPart];
        }
        return result;
    }, []);
    if (fileAndAlias.length === 2) {
        return fileAndAlias;
    }
    // Infer alias from file name
    // e.g: `/home/kalimdor/warchief.thrall.js` --> ['warchief', '/home/kalimdor/warchief.thrall.js']
    const alias = injectionFileAndAlias.split("\\").pop().split("/").pop().split(".").shift();
    return [injectionFileAndAlias, alias];
}
function _getInjectionFileAndAliasList(config, userInjectionFile) {
    const { injection } = config;
    const configInjectionList = Array.isArray(injection) ? injection : [injection];
    const userInjectionList = Array.isArray(userInjectionFile) ? userInjectionFile : [userInjectionFile];
    return configInjectionList
        .concat(userInjectionList)
        .filter((injectionAndAlias) => typeof injectionAndAlias === "string");
}
/**
 * @param declarativeConfig IDeclarativeConfig
 */
function declare(partialDeclarativeConfig) {
    const declarativeConfig = _getCompleteDeclarativeConfig(partialDeclarativeConfig);
    const componentDict = declarativeConfig.component;
    const { bootstrap } = declarativeConfig;
    const componentNameList = Object.keys(componentDict);
    // parse all `${key}`, create function, and register it to parsedDict
    const parsedDict = componentNameList.reduce((tmpParsedDict, componentName) => {
        return _addToParsedDict(tmpParsedDict, declarativeConfig, componentName);
    }, Object.assign({}, { R: exports.R, X: exports.X, console }, declarativeConfig.injection));
    // get `bootstrapFunction`
    const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
    if (!parsedDictVal.found) {
        const error = new Error(`\`${bootstrap}\` is not defined`);
        throw (_getEmbededBootstrapParseError(error, declarativeConfig));
    }
    const bootstrapComponent = parsedDictVal.value;
    return _getBootstrapFunction(declarativeConfig, componentDict, bootstrap, bootstrapComponent);
}
exports.declare = declare;
function _getBootstrapFunction(declarativeConfig, componentDict, bootstrap, bootstrapComponent) {
    if (bootstrap in componentDict) {
        // the bootstrap component is already in componentDict,
        // it means that if the component is a function, it's already wrapped
        if (_isFunction(bootstrapComponent)) {
            return bootstrapComponent;
        }
        return _getWrappedFunction(declarativeConfig, bootstrap, exports.R.always(bootstrapComponent));
    }
    // the bootstrap component is not in componentDict,
    // it's probably declared as injection component, thus not wrapped yet
    const bootstrapFunction = _isFunction(bootstrapComponent) ? bootstrapComponent : exports.R.always(bootstrapComponent);
    return _getWrappedFunction(declarativeConfig, bootstrap, bootstrapFunction);
}
function _getParsedParts(parsedDict, declarativeConfig, componentDict, parentComponentName, parts) {
    if (Array.isArray(parts)) {
        return parts.map((element) => _getParsedParts(parsedDict, declarativeConfig, componentDict, parentComponentName, element));
    }
    if (typeof parts === "object") {
        return Object.keys(parts).reduce((newObj, key) => {
            const val = parts[key];
            return Object.assign({}, newObj, {
                [key]: _getParsedParts(parsedDict, declarativeConfig, componentDict, parentComponentName, val),
            });
        }, {});
    }
    if (typeof parts === "string") {
        const tagPattern = new RegExp(TAG_PATTERN);
        const shortTagPattern = new RegExp(SHORT_TAG_PATTERN);
        const match = tagPattern.exec(parts) || shortTagPattern.exec(parts);
        if (match) {
            const key = match[1];
            const parsedDictVal = _getFromParsedDict(parsedDict, key);
            if (!parsedDictVal.found) {
                if (key in componentDict) {
                    _addToParsedDict(parsedDict, declarativeConfig, key);
                    return _getFromParsedDict(parsedDict, key).value;
                }
                throw (new Error(`Component \`${key}\` is not defined`));
            }
            return parsedDictVal.value;
        }
        // un-escape `\${value}` into `${value}`
        return parts.replace(/^\s*\\\$/gi, "\$");
    }
    return parts;
}
function _getFromParsedDict(parsedDict, searchKey) {
    const searchKeyParts = searchKey.split(".");
    try {
        const value = searchKeyParts.reduce((result, key, keyIndex) => {
            if (key in result) {
                if (keyIndex !== 0 && _isFunction(result[key]) && !_isClass(result[key])) {
                    return result[key].bind(result);
                }
                return result[key];
            }
            throw new Error("Not found");
        }, parsedDict);
        return { value, found: true };
    }
    catch (error) {
        return { found: false, value: null };
    }
}
function _addToParsedDict(parsedDict, declarativeConfig, componentName) {
    try {
        const componentDict = declarativeConfig.component;
        const { setup, parts } = componentDict[componentName];
        const parsedDictVal = _getFromParsedDict(parsedDict, setup);
        if (!parsedDictVal.found) {
            throw new Error(`\`${setup}\` is not defined`);
        }
        const assembler = parsedDictVal.value;
        if (!_isFunction(assembler)) {
            throw new Error(`\`${setup}\` is not a function`);
        }
        if (_isEmptyArray(parts)) {
            parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, assembler);
            return parsedDict;
        }
        const parsedParts = _getParsedParts(parsedDict, declarativeConfig, componentDict, componentName, parts);
        const assembledComponent = assembler(...parsedParts);
        if (!_isFunction(assembledComponent)) {
            parsedDict[componentName] = assembledComponent;
            return parsedDict;
        }
        parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, assembledComponent);
        return parsedDict;
    }
    catch (error) {
        throw (_getEmbededParseError(error, declarativeConfig, componentName));
    }
}
function _getArgsStringRepresentation(args) {
    return util_1.inspect(args).replace(/^\[/g, "(").replace(/\]$/g, ")");
}
function _getWrappedFunction(declarativeConfig, componentName, funcOrVal) {
    const componentDict = declarativeConfig.component;
    const currentComponent = componentName in componentDict ? componentDict[componentName] : { arity: -1 };
    const { arity } = currentComponent;
    function wrappedFunction(...rawArgs) {
        const args = arity < 0 ? rawArgs : rawArgs.slice(0, arity);
        try {
            const funcOut = funcOrVal(...args);
            if (_isPromise(funcOut)) {
                const funcOutWithErrorHandler = funcOut.catch((error) => {
                    return Promise.reject(_getEmbededRuntimeError(error, declarativeConfig, componentName, args));
                });
                return funcOutWithErrorHandler;
            }
            return funcOut;
        }
        catch (error) {
            throw (_getEmbededRuntimeError(error, declarativeConfig, componentName, args));
        }
    }
    return wrappedFunction;
}
function _getEmbededBootstrapParseError(error, declarativeConfig) {
    const { bootstrap } = declarativeConfig;
    const structure = { bootstrap };
    const errorMessage = `Parse error, bootstrap component \`${bootstrap}\`:`;
    return _getEmbededError(error, errorMessage, structure, declarativeConfig);
}
function _getEmbededParseError(error, declarativeConfig, componentName) {
    const componentDict = declarativeConfig.component;
    const structure = { component: { [componentName]: componentDict[componentName] } };
    const errorMessage = `Parse error, component \`${componentName}\`:`;
    return _getEmbededError(error, errorMessage, structure, declarativeConfig);
}
function _getEmbededRuntimeError(error, declarativeConfig, componentName, args) {
    const componentDict = declarativeConfig.component;
    const argsAsString = _getArgsStringRepresentation(args);
    const errorMessage = `Runtime error, component \`${componentName}${argsAsString}\`:`;
    const structure = { component: { [componentName]: componentDict[componentName] } };
    return _getEmbededError(error, errorMessage, structure, declarativeConfig);
}
function _getEmbededError(error, message, structure, declarativeConfig) {
    if (typeof error !== "object" || !error.message) {
        error = new Error(error);
    }
    if (error.message.indexOf("ERROR: ") > -1) {
        return error;
    }
    const declaredComponentList = Object.keys(declarativeConfig.component);
    const injectedComponentList = Object.keys(declarativeConfig.injection);
    const utilInspectOption = { depth: Infinity, colors: true };
    const declaredComponentString = util_1.inspect(declaredComponentList, utilInspectOption);
    const injectedComponentString = util_1.inspect(injectedComponentList, utilInspectOption);
    const newErrorMessage = `${message} ${error.message}`;
    const structureString = util_1.inspect(structure, utilInspectOption);
    error.message = `\n${FG_BRIGHT}${FG_RED}ERROR: ${newErrorMessage}${RESET_COLOR}\n` +
        `${FG_BRIGHT}${FG_YELLOW}ON STRUCTURE:${RESET_COLOR} ${structureString}\n` +
        `${FG_BRIGHT}${FG_CYAN}DECLARED COMPONENTS:${RESET_COLOR} ${declaredComponentString}\n` +
        `${FG_BRIGHT}${FG_CYAN}INJECTED COMPONENTS:${RESET_COLOR} ${injectedComponentString}\n`;
    return error;
}
function _getCompleteDeclarativeConfig(partialConfig) {
    const defaultDeclarativeConfig = {
        injection: {},
        component: {},
        bootstrap: "run",
    };
    const filledConfig = Object.assign({}, defaultDeclarativeConfig, partialConfig);
    // get complete component
    const componentNameList = Object.keys(filledConfig.component);
    const component = componentNameList.reduce((tmpComponent, componentName) => {
        return Object.assign({}, tmpComponent, {
            [componentName]: _getCompleteComponent(filledConfig.component[componentName]),
        });
    }, {});
    // return complete config
    return Object.assign({}, filledConfig, { component });
}
function _getCompleteComponent(rawComponent) {
    const defaultComponent = {
        arity: -1,
        setup: null,
        parts: [],
    };
    const partialComponent = _getPartialComponentWithNormalizesetup(rawComponent);
    const filledComponent = Object.assign({}, defaultComponent, partialComponent);
    // make sure `parts` is an array. Otherwise, turn it into an array
    const parts = Array.isArray(filledComponent.parts) ? filledComponent.parts : [filledComponent.parts];
    // return component component
    return Object.assign({}, filledComponent, { parts });
}
function _getPartialComponentWithNormalizesetup(rawComponent) {
    const partialComponent = _getPartialComponent(rawComponent);
    const { setup } = partialComponent;
    if (Array.isArray(setup)) {
        const [realsetup, ...parts] = setup;
        return Object.assign({}, partialComponent, { setup: realsetup, parts });
    }
    return partialComponent;
}
function _getPartialComponent(rawComponent) {
    if (typeof rawComponent === "string") {
        return { setup: rawComponent };
    }
    if (Array.isArray(rawComponent)) {
        const [setup, ...parts] = rawComponent;
        return { setup, parts };
    }
    return rawComponent;
}
function invoker(arity, ...params) {
    function method(...args) {
        const methodName = params.shift();
        const obj = args.pop();
        const realParams = params.concat(args);
        const value = obj[methodName](...realParams);
        return [value, obj];
    }
    return exports.R.curryN(arity + 2 - params.length, method);
}
function fluent(invokerConfigs, ...fluentParams) {
    const invokerMissingParamCounts = invokerConfigs.map((invokerConfig) => {
        const [arity, methodName, ...defaultParams] = invokerConfig;
        return arity - defaultParams.length;
    });
    function chained(...chainArgs) {
        const obj = chainArgs.pop();
        const args = fluentParams.concat(chainArgs);
        const chains = invokerConfigs.reduce((tmpChains, invokerConfig, configIndex) => {
            const takenParamCount = exports.R.sum(invokerMissingParamCounts.slice(0, configIndex));
            const currentParamCount = invokerMissingParamCounts[configIndex];
            const currentParams = args.slice(takenParamCount, takenParamCount + currentParamCount);
            const [arity, methodName, ...defaultParams] = invokerConfig;
            const invokerParams = defaultParams.concat(currentParams);
            tmpChains.push(invoker(arity, methodName, ...invokerParams));
            if (configIndex === invokerConfigs.length - 1) {
                tmpChains.push(exports.R.head);
                return tmpChains;
            }
            tmpChains.push(exports.R.last);
            return tmpChains;
        }, []);
        const conjunctor = exports.R.pipe;
        return conjunctor(exports.R.identity, ...chains)(obj);
    }
    return exports.R.curryN(exports.R.sum(invokerMissingParamCounts) - fluentParams.length + 1, chained);
}
function initAndFluent(configs, ...params) {
    const missingParamCounts = configs.map((config) => {
        const [arity, methodNameOrConstructor, ...defaultParams] = config;
        return arity - defaultParams.length;
    });
    function chained(...chainArgs) {
        const constructorConfig = configs.shift();
        const [arity, constructor, ...defaultParams] = constructorConfig;
        const constructorParamCount = arity - defaultParams.length;
        const args = params.concat(chainArgs);
        const constructorParams = args.slice(0, constructorParamCount);
        const fluentParams = args.slice(constructorParamCount);
        const obj = constructor(...constructorParams);
        const chain = fluent(configs, ...fluentParams);
        return chain(obj);
    }
    return exports.R.curryN(exports.R.sum(missingParamCounts) - params.length, chained);
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
function _isClass(obj) {
    if (typeof obj === "function" && obj.prototype) {
        return true;
    }
    return false;
}
function _isFunction(obj) {
    if (typeof obj === "function") {
        return true;
    }
    return false;
}
//# sourceMappingURL=index.js.map