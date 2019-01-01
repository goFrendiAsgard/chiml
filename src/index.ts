import { ChildProcess, exec } from "child_process";
import { readFileSync as fsReadFileSync } from "fs";
import { fromJS } from "immutable";
import { safeLoad as yamlSafeLoad } from "js-yaml";
import { dirname as pathDirname, join as pathJoin, resolve as pathResolve } from "path";
import * as Ramda from "ramda";
import { inspect as utilInspect } from "util";
import {
    AnyAsyncFunction, AnyFunction, IClassRunnerConfig, IComponent,
    IDeclarativeConfig, IKeyInParsedDict, IMethodRunnerConfig,
    IObjectWithMethod, IUserComponent, IUserDeclarativeConfig,
    TChimera, TRamda,
} from "./interfaces/descriptor";

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
    createClassInitiator,
    createMethodExecutor,
    createMethodEvaluator,
    foldInput,
    spreadInput,
    concurrent,
    wrapCommand,
    wrapNodeback,
    wrapSync,
};

export function inject(containerFile: string, userInjectionFile: string|string[] = null): AnyFunction {
    const dirname = pathResolve(pathDirname(containerFile));
    const yamlScript = fsReadFileSync(containerFile).toString();
    const config = yamlSafeLoad(yamlScript);
    const rawInjectionFileList = _getInjectionFileAndAliasList(config, userInjectionFile);
    const injection = rawInjectionFileList
        .reduce((tmpInjection, injectionFileAndAlias) => {
            const [injectionFile, alias] = _splitInjectionFileAndAlias(injectionFileAndAlias)
                .map((part) => part.trim());
            const absoluteInjectionFile = injectionFile[0] === "." ? pathJoin(dirname, injectionFile) : injectionFile;
            const obj = require(absoluteInjectionFile);
            return Object.assign({}, tmpInjection, {[alias]: obj});
        }, { R, X });
    return declare(Object.assign({}, config, { injection }));
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
    const globalIns = declarativeConfig.ins;
    const globalOut = declarativeConfig.out;
    const { bootstrap } = declarativeConfig;
    const componentNameList = Object.keys(componentDict);
    const state = {};
    // parse all `${key}`, create function, and register it to parsedDict
    const parsedDict = componentNameList.reduce((tmpParsedDict, componentName) => {
        return _addToParsedDict(tmpParsedDict, state, componentName, declarativeConfig);
    }, Object.assign({}, declarativeConfig.injection));
    // return bootstrap function
    const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
    if (!parsedDictVal.found) {
        const error = new Error(`\`${bootstrap}\` is not defined`);
        throw(_getEmbededBootstrapParseError(error, state, declarativeConfig));
    }
    return _getWrappedBootstrapFunction(declarativeConfig, parsedDict, state);
}

function _getWrappedBootstrapFunction(
    declarativeConfig: IDeclarativeConfig, parsedDict: {[key: string]: any}, state: {[key: string]: any},
): AnyFunction {
    const componentDict = declarativeConfig.component;
    const globalIns = declarativeConfig.ins;
    const globalOut = declarativeConfig.out;
    const { bootstrap } = declarativeConfig;
    function wrappedBootstrapFunction(...args) {
        if (globalIns !== null) {
            const structure = { ins: globalIns, out: globalOut, bootstrap };
            const argsStringRepresentation = _getArgsStringRepresentation(args);
            const embededErrorMessage = `Runtime error, \`${bootstrap}${argsStringRepresentation}\`:`;
            if (args.length < globalIns.length) {
                const error = new Error(`Program expecting ${globalIns.length} arguments, but ${args.length} given`);
                throw(_getEmbededBootstrapRuntimeError(error, state, declarativeConfig, args));
            }
            try {
                state = args.reduce((tmpState, arg, index) => {
                    return _setState(tmpState, globalIns[index], arg);
                }, state);
            } catch (error) {
                throw(_getEmbededBootstrapRuntimeError(error, state, declarativeConfig, args));
            }
        }
        const parsedDictVal = _getFromParsedDict(parsedDict, bootstrap);
        const func = parsedDictVal.value;
        const wrappedFunction = bootstrap in componentDict && parsedDictVal.found ?
            func : _getWrappedFunction(declarativeConfig, bootstrap, func, state);
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

function _getParsedParts(
    parsedDict: {[key: string]: any}, state: {[key: string]: any},
    componentDict: {[key: string]: any}, parentComponentName: string, parts: any,
): any {
    if (Array.isArray(parts)) {
        return parts.map(
            (element) => _getParsedParts(parsedDict, state, componentDict, parentComponentName, element),
        );
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
        const shortTagPattern = new RegExp(SHORT_TAG_PATTERN);
        const match = tagPattern.exec(parts) || shortTagPattern.exec(parts);
        if (match) {
            const key = match[1];
            const parsedDictVal = _getFromParsedDict(parsedDict, key);
            return parsedDictVal.value;
        }
        // un-escape `\${value}` into `${value}`
        return parts.replace(/^\s*\\\$/gi, "\$");
    }
    return parts;
}

function _getFromParsedDict(parsedDict: {[key: string]: any}, searchKey: string): IKeyInParsedDict {
    const searchKeyParts = searchKey.split(".");
    const initialResult: IKeyInParsedDict = {
        value: parsedDict,
        found: false,
    };
    const result = searchKeyParts.reduce((tmpResult, key) => {
        if (key in tmpResult.value) {
            const oldValue = tmpResult.value;
            const newValue = tmpResult.value[key];
            const newBindValue = typeof newValue === "function" ? newValue.bind(oldValue) : newValue;
            return Object.assign(tmpResult, { found: true, value: newBindValue, context: tmpResult.value });
        }
        return Object.assign(tmpResult, { found: false });
    }, initialResult);
    return result;
}

function _addToParsedDict(
    parsedDict: {[key: string]: any}, state: {[key: string]: any},
    componentName: string, declarativeConfig: IDeclarativeConfig,
): {[key: string]: any} {
    try {
        const componentDict = declarativeConfig.component;
        const { ins, out, perform, parts } = componentDict[componentName];
        const parsedDictVal = _getFromParsedDict(parsedDict, perform);
        const performer = parsedDictVal.value;
        if (typeof performer !== "function") {
            throw new Error(`\`${perform}\` is not a function`);
        }
        if (_isEmptyArray(parts)) {
            function nonComposedFunc(...args) {
                return performer(...args);
            }
            parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, nonComposedFunc, state);
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
        parsedDict[componentName] = _getWrappedFunction(declarativeConfig, componentName, composedFunc, state);
        return parsedDict;
    } catch (error) {
        throw(_getEmbededParseError(error, state, declarativeConfig, componentName));
    }
}

function _checkComponentParts(
    parsedDict: {[key: string]: any}, componentDict: {[key: string]: any}, componentName: string,
) {
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

function _getArgsStringRepresentation(args: any[]) {
    return utilInspect(args).replace(/^\[/g, "(").replace(/\]$/g, ")");
}

function _getWrappedFunction(
    declarativeConfig: IDeclarativeConfig, componentName: string,
    func: AnyFunction, state: {[key: string]: any},
): AnyFunction {
    const componentDict = declarativeConfig.component;
    const currentComponent = componentName in componentDict ? componentDict[componentName] : {};
    const { ins, out } = _getCompleteComponent(currentComponent);
    function wrappedFunction(...args) {
        const realArgs = ins === null ? args : _getArrayFromObject(ins, state);
        try {
            const funcOut = func(...realArgs);
            if (_isPromise(funcOut)) {
                const funcOutWithErrorHandler = funcOut.catch((error) => {
                    return Promise.reject(
                        _getEmbededRuntimeError(error, state, declarativeConfig, componentName, realArgs),
                    );
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
        } catch (error) {
            throw(_getEmbededRuntimeError(error, state, declarativeConfig, componentName, realArgs));
        }
    }
    return wrappedFunction;
}

function _setState(state: {[key: string]: any}, key: string, value: any): {[key: string]: any} {
    if (key in state) {
        throw(new Error(`Cannot reassign \`${key}\``));
    }
    state[key] = fromJS(value);
    return state;
}

function _getFromMaybeImmutable(val: any) {
    if (typeof val === "object" && typeof val.toJS === "function") {
        return val.toJS();
    }
    return val;
}

function _getArrayFromObject(keys: string[], obj: {[key: string]: any}): any[] {
    return keys.map((key) => _getFromMaybeImmutable(obj[key]));
}

function _getEmbededBootstrapParseError(
    error: any, state: {[key: string]: any},
    declarativeConfig: IDeclarativeConfig,
) {
    const globalIns = declarativeConfig.ins;
    const globalOut = declarativeConfig.out;
    const { bootstrap } = declarativeConfig;
    const structure = { ins: globalIns, out: globalOut, bootstrap };
    const errorMessage = `Parse error, bootstrap component \`${bootstrap}\`:`;
    return _getEmbededError(error, errorMessage, state, structure, declarativeConfig);
}

function _getEmbededBootstrapRuntimeError(
    error: any, state: {[key: string]: any},
    declarativeConfig: IDeclarativeConfig,
    args: any[],
): any {
    const globalIns = declarativeConfig.ins;
    const globalOut = declarativeConfig.out;
    const { bootstrap } = declarativeConfig;
    const realArgsAsString = _getArgsStringRepresentation(args);
    const errorMessage = `Runtime error, bootstrap component \`${bootstrap}${realArgsAsString}\`:`;
    const structure = { ins: globalIns, out: globalOut, bootstrap };
    return _getEmbededError(error, errorMessage, state, structure, declarativeConfig);
}

function _getEmbededParseError(
    error: any, state: {[key: string]: any},
    declarativeConfig: IDeclarativeConfig, componentName: string,
) {
    const componentDict = declarativeConfig.component;
    const structure = { component: {[componentName]: componentDict[componentName]} };
    const errorMessage = `Parse error, component \`${componentName}\`:`;
    return _getEmbededError(error, errorMessage, state, structure, declarativeConfig);
}

function _getEmbededRuntimeError(
    error: any, state: {[key: string]: any},
    declarativeConfig: IDeclarativeConfig, componentName: string, args: any[],
): any {
    const componentDict = declarativeConfig.component;
    const realArgsAsString = _getArgsStringRepresentation(args);
    const errorMessage = `Runtime error, component \`${componentName}${realArgsAsString}\`:`;
    const structure = { component: {[componentName]: componentDict[componentName]} };
    return _getEmbededError(error, errorMessage, state, structure, declarativeConfig);
}

function _getEmbededError(
    error: any, message: string, state: {[key: string]: any}, structure: {[key: string]: any},
    declarativeConfig: IDeclarativeConfig,
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
    const stateString = utilInspect(state, utilInspectOption);
    const structureString = utilInspect(structure, utilInspectOption);
    error.message = `\n${FG_BRIGHT}${FG_RED}ERROR: ${newErrorMessage}${RESET_COLOR}\n` +
        `${FG_BRIGHT}${FG_YELLOW}ON STRUCTURE:${RESET_COLOR} ${structureString}\n` +
        `${FG_BRIGHT}${FG_CYAN}CURRENT STATE:${RESET_COLOR} ${stateString}\n` +
        `${FG_BRIGHT}${FG_CYAN}DECLARED COMPONENTS:${RESET_COLOR} ${declaredComponentString}\n` +
        `${FG_BRIGHT}${FG_CYAN}INJECTED COMPONENTS:${RESET_COLOR} ${injectedComponentString}\n`;
    return error;
}

function _getCompleteDeclarativeConfig(partialConfig: Partial<IUserDeclarativeConfig>): IDeclarativeConfig {
    const defaultDeclarativeConfig = {
        ins: null,
        out: null,
        injection: {},
        component: {},
        bootstrap: "run",
    };
    const filledConfig = Object.assign({}, defaultDeclarativeConfig, partialConfig) as IDeclarativeConfig;
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

function _getCompleteComponent(rawComponent: Partial<IUserComponent>| string | string[]): IComponent {
    const defaultComponent = {
        ins: null,
        out: null,
        perform: null,
        parts: [],
    };
    const partialComponent = _getPartialComponentWithNormalizePerform(rawComponent);
    const filledComponent = Object.assign({}, defaultComponent, partialComponent) as IComponent;
    // make sure `ins` is either null or an array. Otherwise, turn it into an array
    const ins = filledComponent.ins !== null && !Array.isArray(filledComponent.ins) ?
        [filledComponent.ins] : filledComponent.ins;
    // make sure `parts` is an array. Otherwise, turn it into an array
    const parts = Array.isArray(filledComponent.parts) ? filledComponent.parts : [filledComponent.parts];
    // return component component
    return Object.assign({}, filledComponent, { ins, parts });
}

function _getPartialComponentWithNormalizePerform(
    rawComponent: Partial<IUserComponent> | string | string[],
): Partial<IUserComponent> {
    const partialComponent = _getPartialComponent(rawComponent);
    const { perform } = partialComponent;
    if (Array.isArray(perform)) {
        const [realPerform, ...parts] = perform;
        return Object.assign({}, partialComponent, { perform: realPerform, parts });
    }
    return partialComponent;
}

function _getPartialComponent(rawComponent: Partial<IUserComponent>| string | string[]): Partial<IUserComponent> {
    if (typeof rawComponent === "string") {
        return { perform: rawComponent };
    }
    if (Array.isArray(rawComponent)) {
        const [perform, ...parts] = rawComponent;
        return { perform, parts };
    }
    return rawComponent;
}

function initClassAndRun<T extends IObjectWithMethod>(classRunnerConfig: Partial<IClassRunnerConfig>): any {
    const { pipe, initClass, initParams, executions, evaluation } = _getCompleteClassRunnerConfig(classRunnerConfig);
    const classInitiator: (...args: any[]) => T = createClassInitiator(initClass);
    const executorList = executions.map((methodRunnerConfig) => {
        const { method, params } = _getCompleteMethodRunnerConfig(methodRunnerConfig);
        return createMethodExecutor(method, ...params);
    });
    if (evaluation) {
        const { method, params } = _getCompleteMethodRunnerConfig(evaluation);
        const evaluator = createMethodEvaluator(method, ...params);
        const executorAndEvaluatorList = executorList.concat([evaluator]);
        return pipe(classInitiator, ...executorAndEvaluatorList)(...initParams);
    }
    return pipe(classInitiator, ...executorList)(...initParams);
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
        initClass: {},
        initParams: [],
        executions: [],
    };
    const filledConfig = Object.assign({}, defaultClassRunnerConfig, classRunnerConfig);
    const initParams = Array.isArray(filledConfig.initParams) ? filledConfig.initParams : [filledConfig.initParams];
    return Object.assign({}, filledConfig, { initParams });
}

function createClassInitiator<T extends IObjectWithMethod>(cls: any): (...args: any[]) => T {
    function classInitiator(...args: any[]): T {
        return new cls(...args) as T;
    }
    return classInitiator;
}

function createMethodEvaluator(methodName: string, ...args: any[]): (obj: IObjectWithMethod) => any  {
    function methodEvaluator(obj: IObjectWithMethod): any {
        return obj[methodName](...args);
    }
    return methodEvaluator;
}

function createMethodExecutor<T extends IObjectWithMethod>(methodName: string, ...args: any[]): (obj: T) => T  {
    function methodExecutor(obj: T): T {
        obj[methodName](...args);
        return obj;
    }
    return methodExecutor;
}

/**
 * @param fn AnyFunction
 */
function spreadInput<TArg, TResult>(fn: (arr: TArg[]) => TResult): (...args: TArg[]) => TResult {
    function spreaded(...args: TArg[]): TResult {
        return fn(args);
    }
    return spreaded;
}

/**
 * @param fn AnyFunction
 */
function foldInput<TArg, TResult>(fn: (...args: TArg[]) => TResult): (arr: TArg[]) => TResult {
    function folded(arr: any[]): any {
        return fn(...arr);
    }
    return folded;
}

/**
 * @param fnList AnyAsynchronousFunction
 */
function concurrent(...fnList: AnyAsyncFunction[]): AnyAsyncFunction {
    function concurrentAction(...args: any[]): Promise<any> {
        const promises: Array<Promise<any>> = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return concurrentAction;
}

/**
 * @param fn AnyFunction
 */
function wrapSync<TArg, TResult>(fn: (...args: TArg[]) => TResult): (...args: TArg[]) => Promise<TResult> {
    async function wrappedSync(...args: TArg[]): Promise<TResult> {
        return Promise.resolve(fn(...args));
    }
    return wrappedSync;
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
