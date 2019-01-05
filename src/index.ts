import { ChildProcess, exec } from "child_process";
import { readFileSync as fsReadFileSync } from "fs";
import { fromJS } from "immutable";
import { safeLoad as yamlSafeLoad } from "js-yaml";
import { dirname as pathDirname, isAbsolute, join as pathJoin, resolve as pathResolve } from "path";
import * as Ramda from "ramda";
import { inspect as utilInspect } from "util";
import {
    AnyAsyncFunction, AnyFunction, IClassRunnerConfig, IComponent,
    IDeclarativeConfig, IKeyInParsedDict, IMethodRunnerConfig,
    IObjectWithMethod, IUserComponent, IUserDeclarativeConfig,
    TChimera, TRamda,
} from "./interfaces/descriptor";

const { createRequireFromPath } = require("module");

const FG_BRIGHT = "\x1b[1m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
const TAG_PATTERN = /^\s*\$\{(.+)\}\s*$/gi;
const SHORT_TAG_PATTERN = /^\s*\$([a-z0-9_\-\.]+)\s*$/gi;

export const R: TRamda = Ramda;

export const X: TChimera = {
    declare,
    inject: R.curryN(2, inject),
    initClassAndRun,
    getMethodExecutor,
    getMethodEvaluator,
    concurrent,
    wrapCommand,
    wrapNodeback,
};

export function inject(containerFile: string, userInjectionFile: string | string[] = null): AnyFunction {
    try {
        const dirname = pathResolve(pathDirname(containerFile));
        const relativeRequire = createRequireFromPath(containerFile);
        const yamlScript = fsReadFileSync(containerFile).toString();
        const config = yamlSafeLoad(yamlScript);
        const rawInjectionFileList = _getInjectionFileAndAliasList(config, userInjectionFile);
        const injection = rawInjectionFileList
        .reduce((tmpInjection, injectionFileAndAlias) => {
            const [injectionFile, alias] = _splitInjectionFileAndAlias(injectionFileAndAlias)
            .map((part) => part.trim());
            const obj = relativeRequire(injectionFile);
            return Object.assign({}, tmpInjection, {[alias]: obj});
        }, { R, X, console });
        return declare(Object.assign({}, config, { injection }));
    } catch (error) {
        error.message = `CONTAINER FILE: ${containerFile}\n${error.message}`;
        throw(error);
    }
}

function _splitInjectionFileAndAlias(injectionFileAndAlias: string): string[] {
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

function _getInjectionFileAndAliasList(
    config: {injection?: string|string[]}, userInjectionFile: string|string[],
): string[] {
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
function declare(partialDeclarativeConfig: Partial<IUserDeclarativeConfig>): AnyFunction {
    const declarativeConfig = _getCompleteDeclarativeConfig(partialDeclarativeConfig);
    const componentDict = declarativeConfig.component;
    const { bootstrap } = declarativeConfig;
    const componentNameList = Object.keys(componentDict);
    // parse all `${key}`, create function, and register it to parsedDict
    const parsedDict = componentNameList.reduce((tmpParsedDict, componentName) => {
        return _addToParsedDict(tmpParsedDict, declarativeConfig, componentName);
    }, Object.assign({}, { R, X, console }, declarativeConfig.injection));
    // return bootstrap function
    const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
    if (!parsedDictVal.found) {
        const error = new Error(`\`${bootstrap}\` is not defined`);
        throw(_getEmbededBootstrapParseError(error, declarativeConfig));
    }
    const fn = parsedDictVal.value;
    return bootstrap in componentDict ? fn : _getWrappedFunction(declarativeConfig, bootstrap, fn);
}

function _getParsedParts(
    parsedDict: {[key: string]: any}, declarativeConfig: IDeclarativeConfig,
    componentDict: {[key: string]: any}, parentComponentName: string, parts: any,
): any {
    if (Array.isArray(parts)) {
        return parts.map(
            (element) => _getParsedParts(parsedDict, declarativeConfig, componentDict, parentComponentName, element),
        );
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
                throw(new Error(`Component \`${key}\` is not defined`));
            }
            return parsedDictVal.value;
        }
        // un-escape `\${value}` into `${value}`
        return parts.replace(/^\s*\\\$/gi, "\$");
    }
    return parts;
}

function _getFromParsedDict(parsedDict: {[key: string]: any}, searchKey: string): IKeyInParsedDict {
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
    } catch (error) {
        return { found: false, value: null };
    }
}

function _addToParsedDict(
    parsedDict: {[key: string]: any}, declarativeConfig: IDeclarativeConfig, componentName: string,
): {[key: string]: any} {
    try {
        const componentDict = declarativeConfig.component;
        const { setup, parts } = componentDict[componentName];
        const parsedDictVal = _getFromParsedDict(parsedDict, setup);
        if (!parsedDictVal.found) {
            throw new Error(`\`${setup}\` is not defined`);
        }
        const assembler = parsedDictVal.value;
        if (typeof assembler !== "function") {
            throw new Error(`\`${setup}\` is not a function`);
        }
        if (_isEmptyArray(parts)) {
            function nonComposedFunc(...args) {
                return assembler(...args);
            }
            parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, nonComposedFunc);
            return parsedDict;
        }
        const parsedParts = _getParsedParts(parsedDict, declarativeConfig, componentDict, componentName, parts);
        const runner = assembler(...parsedParts);
        if (typeof runner !== "function") {
            const parsedPartsAsString = _getArgsStringRepresentation(parsedParts);
            throw new Error(`Result of \`${setup}${parsedPartsAsString}\` is not a function`);
        }
        function composedFunc(...args) {
            return runner(...args);
        }
        parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, composedFunc);
        return parsedDict;
    } catch (error) {
        throw(_getEmbededParseError(error, declarativeConfig, componentName));
    }
}

function _getArgsStringRepresentation(args: any[]) {
    return utilInspect(args).replace(/^\[/g, "(").replace(/\]$/g, ")");
}

function _getWrappedFunction(
    declarativeConfig: IDeclarativeConfig, componentName: string, func: AnyFunction,
): AnyFunction {
    const componentDict = declarativeConfig.component;
    const currentComponent = componentName in componentDict ? componentDict[componentName] : { arity: -1 };
    const { arity } = currentComponent;
    function wrappedFunction(...rawArgs) {
        const args = arity < 0 ? rawArgs : rawArgs.slice(0, arity);
        try {
            const funcOut = func(...args);
            if (_isPromise(funcOut)) {
                const funcOutWithErrorHandler = funcOut.catch((error) => {
                    return Promise.reject(
                        _getEmbededRuntimeError(error, declarativeConfig, componentName, args),
                    );
                });
                return funcOutWithErrorHandler;
            }
            return funcOut;
        } catch (error) {
            throw(_getEmbededRuntimeError(error, declarativeConfig, componentName, args));
        }
    }
    return wrappedFunction;
}

function _getEmbededBootstrapParseError(
    error: any, declarativeConfig: IDeclarativeConfig,
) {
    const { bootstrap } = declarativeConfig;
    const structure = { bootstrap };
    const errorMessage = `Parse error, bootstrap component \`${bootstrap}\`:`;
    return _getEmbededError(error, errorMessage, structure, declarativeConfig);
}

function _getEmbededParseError(
    error: any, declarativeConfig: IDeclarativeConfig, componentName: string,
) {
    const componentDict = declarativeConfig.component;
    const structure = { component: {[componentName]: componentDict[componentName]} };
    const errorMessage = `Parse error, component \`${componentName}\`:`;
    return _getEmbededError(error, errorMessage, structure, declarativeConfig);
}

function _getEmbededRuntimeError(
    error: any, declarativeConfig: IDeclarativeConfig, componentName: string, args: any[],
): any {
    const componentDict = declarativeConfig.component;
    const argsAsString = _getArgsStringRepresentation(args);
    const errorMessage = `Runtime error, component \`${componentName}${argsAsString}\`:`;
    const structure = { component: {[componentName]: componentDict[componentName]} };
    return _getEmbededError(error, errorMessage, structure, declarativeConfig);
}

function _getEmbededError(
    error: any, message: string, structure: {[key: string]: any}, declarativeConfig: IDeclarativeConfig,
): any {
    if (typeof error !== "object" || !error.message) {
        error = new Error(error);
    }
    if (error.message.indexOf("ERROR: ") > -1) {
        return error;
    }
    const declaredComponentList = Object.keys(declarativeConfig.component);
    const injectedComponentList = Object.keys(declarativeConfig.injection);
    const utilInspectOption = { depth: Infinity, colors: true };
    const declaredComponentString = utilInspect(declaredComponentList, utilInspectOption);
    const injectedComponentString = utilInspect(injectedComponentList, utilInspectOption);
    const newErrorMessage = `${message} ${error.message}`;
    const structureString = utilInspect(structure, utilInspectOption);
    error.message = `\n${FG_BRIGHT}${FG_RED}ERROR: ${newErrorMessage}${RESET_COLOR}\n` +
        `${FG_BRIGHT}${FG_YELLOW}ON STRUCTURE:${RESET_COLOR} ${structureString}\n` +
        `${FG_BRIGHT}${FG_CYAN}DECLARED COMPONENTS:${RESET_COLOR} ${declaredComponentString}\n` +
        `${FG_BRIGHT}${FG_CYAN}INJECTED COMPONENTS:${RESET_COLOR} ${injectedComponentString}\n`;
    return error;
}

function _getCompleteDeclarativeConfig(partialConfig: Partial<IUserDeclarativeConfig>): IDeclarativeConfig {
    const defaultDeclarativeConfig = {
        injection: {},
        component: {},
        bootstrap: "run",
    };
    const filledConfig = Object.assign({}, defaultDeclarativeConfig, partialConfig) as IDeclarativeConfig;
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

function _getCompleteComponent(rawComponent: Partial<IUserComponent>| string | string[]): IComponent {
    const defaultComponent = {
        arity: -1,
        setup: null,
        parts: [],
    };
    const partialComponent = _getPartialComponentWithNormalizesetup(rawComponent);
    const filledComponent = Object.assign({}, defaultComponent, partialComponent) as IComponent;
    // make sure `parts` is an array. Otherwise, turn it into an array
    const parts = Array.isArray(filledComponent.parts) ? filledComponent.parts : [filledComponent.parts];
    // return component component
    return Object.assign({}, filledComponent, { parts });
}

function _getPartialComponentWithNormalizesetup(
    rawComponent: Partial<IUserComponent> | string | string[],
): Partial<IUserComponent> {
    const partialComponent = _getPartialComponent(rawComponent);
    const { setup } = partialComponent;
    if (Array.isArray(setup)) {
        const [realsetup, ...parts] = setup;
        return Object.assign({}, partialComponent, { setup: realsetup, parts });
    }
    return partialComponent;
}

function _getPartialComponent(rawComponent: Partial<IUserComponent>| string | string[]): Partial<IUserComponent> {
    if (typeof rawComponent === "string") {
        return { setup: rawComponent };
    }
    if (Array.isArray(rawComponent)) {
        const [setup, ...parts] = rawComponent;
        return { setup, parts };
    }
    return rawComponent;
}

function initClassAndRun<T extends IObjectWithMethod>(classRunnerConfig: Partial<IClassRunnerConfig>): any {
    const {
        pipe, initClass, initFunction, initParams, executions, evaluation,
    } = _getCompleteClassRunnerConfig(classRunnerConfig);
    const classInitiator: (...args: any[]) => T = initClass ? R.construct(initClass) : initFunction;
    const executorList = executions.map((methodRunnerConfig) => {
        const { method, params } = _getCompleteMethodRunnerConfig(methodRunnerConfig);
        return getMethodExecutor(method, ...params);
    });
    if (evaluation) {
        const { method, params } = _getCompleteMethodRunnerConfig(evaluation);
        const evaluator = getMethodEvaluator(method, ...params);
        const executorAndEvaluatorList = executorList.concat([evaluator]);
        return (...args) => pipe(classInitiator, ...executorAndEvaluatorList)(...initParams.concat(args));
    }
    if (executorList.length === 0) {
        throw(new Error("`executions` or `evaluation` expected"));
    }
    return (...args) => pipe(classInitiator, ...executorList)(...initParams.concat(args));
}

function _getCompleteMethodRunnerConfig(
    rawMethodRunnerConfig: Partial<IMethodRunnerConfig>| any[],
): IMethodRunnerConfig {
    const defaultMethodRunnerConfig: IMethodRunnerConfig = {
        method: "",
        params: [],
    };
    const methodRunnerConfig = _getMethodRunnerConfig(rawMethodRunnerConfig);
    const filledConfig = Object.assign({}, defaultMethodRunnerConfig, methodRunnerConfig);
    const params = Array.isArray(filledConfig.params) ? filledConfig.params : [filledConfig.params];
    return Object.assign({}, filledConfig, { params });
}

function _getMethodRunnerConfig(
    rawMethodRunnerConfig: Partial<IMethodRunnerConfig>| any[],
): Partial<IMethodRunnerConfig> {
    if (typeof rawMethodRunnerConfig === "string") {
        return { method: rawMethodRunnerConfig };
    }
    if (Array.isArray(rawMethodRunnerConfig)) {
        const [method, ...params] = rawMethodRunnerConfig;
        return { method, params };
    }
    return rawMethodRunnerConfig as Partial<IMethodRunnerConfig>;
}

function _getCompleteClassRunnerConfig(classRunnerConfig: Partial<IClassRunnerConfig>): IClassRunnerConfig {
    const defaultClassRunnerConfig: IClassRunnerConfig = {
        pipe: R.pipe,
        initParams: [],
        executions: [],
    };
    const filledConfig = Object.assign({}, defaultClassRunnerConfig, classRunnerConfig);
    const initParams = Array.isArray(filledConfig.initParams) ? filledConfig.initParams : [filledConfig.initParams];
    return Object.assign({}, filledConfig, { initParams });
}

function getMethodEvaluator(methodName: string, ...args: any[]): (obj: IObjectWithMethod) => any  {
    function methodEvaluator(obj: IObjectWithMethod): any {
        return obj[methodName](...args);
    }
    return methodEvaluator;
}

function getMethodExecutor<T extends IObjectWithMethod>(methodName: string, ...args: any[]): (obj: T) => T  {
    function methodExecutor(obj: T): T {
        obj[methodName](...args);
        return obj;
    }
    return methodExecutor;
}

/**
 * @param fnList AnyAsynchronousFunction
 */
function concurrent(...fnList: AnyFunction[]): AnyAsyncFunction {
    function concurrentAction(...args: any[]): Promise<any> {
        const promises: Array<Promise<any>> = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return concurrentAction;
}

/**
 * @param fn AnyFunction
 */
function wrapNodeback(fn: AnyFunction): AnyAsyncFunction {
    function wrappedNodeback(...args: any[]): Promise<any> {
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
function wrapCommand(stringCommand: string): AnyAsyncFunction {
    function wrappedCommand(...args: any[]): Promise<any> {
        const composedStringCommand = _getEchoPipedStringCommand(stringCommand, args);
        return _runStringCommand(composedStringCommand);
    }
    return wrappedCommand;
}

/**
 * @param strCmd string
 * @param ins any[]
 */
function _getEchoPipedStringCommand(strCmd: string, ins: any[]): string {
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
function _runStringCommand(stringCommand: string, options?: { [key: string]: any }): Promise<any> {
    return new Promise((resolve, reject) => {
        // define subProcess
        const subProcess = exec(stringCommand, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            try {
                return resolve(JSON.parse(stdout));
            } catch (error) {
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
function _getStringCommandWithParams(strCmd: string, ins: any[]): string {
    const pattern = /([^\\])\$[\{]?([0-9]+)[\}]?/g;
    if (strCmd.match(pattern)) {
        return strCmd.replace(pattern, (match, notBackSlash, paramIndex): string => {
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
function _getDoubleQuotedString(str: string): string {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}

/**
 * @param arr any[]
 */
function _isEmptyArray(arr: any[]): boolean {
    if (Array.isArray(arr) && arr.length === 0) {
        return true;
    }
    return false;
}

/**
 * @param obj any
 */
function _isPromise(obj: any): boolean {
    if (typeof obj === "object" && obj.then) {
        return true;
    }
    return false;
}

function _isClass(obj): boolean {
    if (typeof(obj) === "function" && obj.prototype) {
        return true;
    }
    return false;
}
