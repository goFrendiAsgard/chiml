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
    declare,
    inject: exports.R.curryN(2, inject),
    initClassAndRun,
    getMethodExecutor,
    getMethodEvaluator,
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
        }, { R: exports.R, X: exports.X, console });
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
    // return bootstrap function
    const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
    if (!parsedDictVal.found) {
        const error = new Error(`\`${bootstrap}\` is not defined`);
        throw (_getEmbededBootstrapParseError(error, declarativeConfig));
    }
    const fn = parsedDictVal.value;
    return bootstrap in componentDict ? fn : _getWrappedFunction(declarativeConfig, bootstrap, fn);
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
                if (keyIndex !== 0 && typeof result[key] === "function" && !_isClass(result[key])) {
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
        const { perform, parts } = componentDict[componentName];
        const parsedDictVal = _getFromParsedDict(parsedDict, perform);
        if (!parsedDictVal.found) {
            throw new Error(`\`${perform}\` is not defined`);
        }
        const performer = parsedDictVal.value;
        if (typeof performer !== "function") {
            throw new Error(`\`${perform}\` is not a function`);
        }
        if (_isEmptyArray(parts)) {
            function nonComposedFunc(...args) {
                return performer(...args);
            }
            parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, nonComposedFunc);
            return parsedDict;
        }
        const parsedParts = _getParsedParts(parsedDict, declarativeConfig, componentDict, componentName, parts);
        function composedFunc(...args) {
            const performerPlusParts = performer(...parsedParts);
            const realFunction = typeof performerPlusParts === "function" ?
                performerPlusParts : () => performerPlusParts;
            return realFunction(...args);
        }
        parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, composedFunc);
        return parsedDict;
    }
    catch (error) {
        throw (_getEmbededParseError(error, declarativeConfig, componentName));
    }
}
function _getArgsStringRepresentation(args) {
    return util_1.inspect(args).replace(/^\[/g, "(").replace(/\]$/g, ")");
}
function _getWrappedFunction(declarativeConfig, componentName, func) {
    const componentDict = declarativeConfig.component;
    const currentComponent = componentName in componentDict ? componentDict[componentName] : { arity: -1 };
    const { arity } = currentComponent;
    function wrappedFunction(...rawArgs) {
        const args = arity < 0 ? rawArgs : rawArgs.slice(0, arity);
        try {
            const funcOut = func(...args);
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
    const realArgsAsString = _getArgsStringRepresentation(args);
    const errorMessage = `Runtime error, component \`${componentName}${realArgsAsString}\`:`;
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
        perform: null,
        parts: [],
    };
    const partialComponent = _getPartialComponentWithNormalizePerform(rawComponent);
    const filledComponent = Object.assign({}, defaultComponent, partialComponent);
    // make sure `parts` is an array. Otherwise, turn it into an array
    const parts = Array.isArray(filledComponent.parts) ? filledComponent.parts : [filledComponent.parts];
    // return component component
    return Object.assign({}, filledComponent, { parts });
}
function _getPartialComponentWithNormalizePerform(rawComponent) {
    const partialComponent = _getPartialComponent(rawComponent);
    const { perform } = partialComponent;
    if (Array.isArray(perform)) {
        const [realPerform, ...parts] = perform;
        return Object.assign({}, partialComponent, { perform: realPerform, parts });
    }
    return partialComponent;
}
function _getPartialComponent(rawComponent) {
    if (typeof rawComponent === "string") {
        return { perform: rawComponent };
    }
    if (Array.isArray(rawComponent)) {
        const [perform, ...parts] = rawComponent;
        return { perform, parts };
    }
    return rawComponent;
}
function initClassAndRun(classRunnerConfig) {
    const { pipe, initClass, initFunction, initParams, executions, evaluation, } = _getCompleteClassRunnerConfig(classRunnerConfig);
    const classInitiator = initClass ? exports.R.construct(initClass) : initFunction;
    const executorList = executions.map((methodRunnerConfig) => {
        const { method, params } = _getCompleteMethodRunnerConfig(methodRunnerConfig);
        return getMethodExecutor(method, ...params);
    });
    if (evaluation) {
        const { method, params } = _getCompleteMethodRunnerConfig(evaluation);
        const evaluator = getMethodEvaluator(method, ...params);
        const executorAndEvaluatorList = executorList.concat([evaluator]);
        return pipe(classInitiator, ...executorAndEvaluatorList)(...initParams);
    }
    if (executorList.length === 0) {
        throw (new Error("`executions` or `evaluation` expected"));
    }
    return pipe(classInitiator, ...executorList)(...initParams);
}
function _getCompleteMethodRunnerConfig(rawMethodRunnerConfig) {
    const defaultMethodRunnerConfig = {
        method: "",
        params: [],
    };
    const methodRunnerConfig = _getMethodRunnerConfig(rawMethodRunnerConfig);
    const filledConfig = Object.assign({}, defaultMethodRunnerConfig, methodRunnerConfig);
    const params = Array.isArray(filledConfig.params) ? filledConfig.params : [filledConfig.params];
    return Object.assign({}, filledConfig, { params });
}
function _getMethodRunnerConfig(rawMethodRunnerConfig) {
    if (typeof rawMethodRunnerConfig === "string") {
        return { method: rawMethodRunnerConfig };
    }
    if (Array.isArray(rawMethodRunnerConfig)) {
        const [method, ...params] = rawMethodRunnerConfig;
        return { method, params };
    }
    return rawMethodRunnerConfig;
}
function _getCompleteClassRunnerConfig(classRunnerConfig) {
    const defaultClassRunnerConfig = {
        pipe: exports.R.pipe,
        initParams: [],
        executions: [],
    };
    const filledConfig = Object.assign({}, defaultClassRunnerConfig, classRunnerConfig);
    const initParams = Array.isArray(filledConfig.initParams) ? filledConfig.initParams : [filledConfig.initParams];
    return Object.assign({}, filledConfig, { initParams });
}
function getMethodEvaluator(methodName, ...args) {
    function methodEvaluator(obj) {
        return obj[methodName](...args);
    }
    return methodEvaluator;
}
function getMethodExecutor(methodName, ...args) {
    function methodExecutor(obj) {
        obj[methodName](...args);
        return obj;
    }
    return methodExecutor;
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
    if (typeof (obj) === "function" && obj.prototype) {
        return true;
    }
    return false;
}
//# sourceMappingURL=index.js.map