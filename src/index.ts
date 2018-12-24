import { ChildProcess, exec } from "child_process";
import { readFileSync as fsReadFileSync } from "fs";
import { safeLoad as yamlSafeLoad } from "js-yaml";
import { dirname as pathDirname, join as pathJoin, resolve as pathResolve } from "path";
import * as R from "ramda";
import { inspect as utilInspect } from "util";
import {
    AnyAsyncFunction, AnyFunction, IComponent, IDeclarativeConfig,
    IKeyInParsedDict, IUserComponent, IUserDeclarativeConfig, TChimera,
} from "./interfaces/descriptor";

const FG_BRIGHT = "\x1b[1m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
const TAG_PATTERN = /^\s*\$\{(.+)\}\s*$/gi;

export const X: TChimera = Object.assign({}, R, {
    declarative,
    execute,
    foldInput,
    spreadInput,
    concurrent,
    wrapCommand,
    wrapNodeback,
    wrapSync,
});

export function execute(containerFile: string, injectionFile: string = null): AnyFunction {
    const yamlScript = fsReadFileSync(containerFile).toString();
    const config = yamlSafeLoad(yamlScript);
    // define config.injection
    if (injectionFile === null && config.injection && config.injection[0] === ".") {
        const dirname = pathResolve(pathDirname(containerFile));
        injectionFile = pathJoin(dirname, config.injection);
    }
    if (injectionFile) {
        config.injection = require(injectionFile);
        return X.declarative(config);
    }
    config.injection = { X };
    return X.declarative(config);
}

/**
 * @param declarativeConfig IDeclarativeConfig
 */
function declarative(partialDeclarativeConfig: Partial<IUserDeclarativeConfig>): AnyFunction {
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
        const error = new Error(`Bootstrap component \`${bootstrap}\` is not defined`);
        const structure = {
            ins: globalIns,
            out: globalOut,
            bootstrap,
        };
        throw(_getEmbededError(error, "", state, structure));

    }
    return _getWrappedBootstrapFunction(bootstrap, componentDict, parsedDict, globalIns, globalOut, state);
}

function _getWrappedBootstrapFunction(
    bootstrap: string,
    componentDict: {[key: string]: Partial<IComponent>},
    parsedDict: {[key: string]: any},
    globalIns: string[],
    globalOut: string,
    state: {[key: string]: any},
): AnyFunction {
    function wrappedBootstrapFunction(...args) {
        if (globalIns !== null) {
            if (args.length < globalIns.length) {
                const error = new Error(`Program expecting ${globalIns.length} arguments, but ${args.length} given`);
                const structure = {
                    ins: globalIns,
                    out: globalOut,
                    bootstrap,
                };
                throw(_getEmbededError(error, "", state, structure));
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

function _getFromParsedDict(parsedDict: {[key: string]: any}, searchKey: string): IKeyInParsedDict {
    const searchKeyParts = searchKey.split(".");
    const initialResult: IKeyInParsedDict = {
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

function _addToParsedDict(
    parsedDict: {[key: string]: any}, state: {[key: string]: any},
    componentDict: {[key: string]: any}, componentName: string,
): {[key: string]: any} {
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
            parsedDict[componentName] = _getWrappedFunction(
                componentName, componentDict, nonComposedFunc, ins, out, state,
            );
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
    } catch (error) {
        throw(_getEmbededParsingError(error, state, componentName, componentDict));
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

function _getEmbededParsingError(
    error: any, state: {[key: string]: any},
    componentName: string, componentDict: {[key: string]: any},
) {
    const { perform } = componentDict[componentName];
    const structure = { component: {[componentName]: componentDict[componentName]} };
    return _getEmbededError(
        error,
        `Parse error, component \`${componentName}\`:`,
        state,
        structure,
    );
}

function _getArgsStringRepresentation(args: any[]) {
    return utilInspect(args).replace(/^\[/g, "(").replace(/\]$/g, ")");
}

function _getWrappedFunction(
    componentName: string, componentDict: {[key: string]: Partial<IComponent>},
    func: AnyFunction, ins: string[] | null, out: string | null, state: {[key: string]: any},
): AnyFunction {
    function wrappedFunction(...args) {
        const realArgs = ins === null ? args : _getArrayFromObject(ins, state);
        try {
            const funcOut = func(...realArgs);
            if (_isPromise(funcOut)) {
                const funcOutWithErrorHandler = funcOut.catch((error) => {
                    return Promise.reject(
                        _getEmbededExecutionError(error, state, componentName, componentDict, realArgs),
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
            throw(_getEmbededExecutionError(error, state, componentName, componentDict, realArgs));
        }
    }
    return wrappedFunction;
}

function _getEmbededExecutionError(
    error: any, state: {[key: string]: any},
    componentName: string, componentDict: {[key: string]: Partial<IComponent>},
    args: any[],
): any {
    const realArgsAsString = _getArgsStringRepresentation(args);
    const errorMessage = `Runtime error, component \`${componentName}${realArgsAsString}\`:`;
    const structure = { component: {[componentName]: componentDict[componentName]} };
    return _getEmbededError(error, errorMessage, state, structure);
}

function _setState(state: {[key: string]: any}, key: string, value: any): {[key: string]: any} {
    if (key in state) {
        throw(new Error(`Cannot reassign \`${key}\``));
    }
    state[key] = _freeze(value);
    return state;
}

function _freeze(value: any, processedValues: any[] = []) {
    const valueIsObject = typeof value === "object";
    const valueIsFunction = typeof value === "function";
    const valueIsArray = Array.isArray(value);
    const valueIsProcessed = processedValues.indexOf(value) > -1;
    if ((valueIsObject || valueIsFunction || valueIsArray) && valueIsProcessed) {
        return value;
    }
    if (valueIsObject || valueIsArray) {
        processedValues.push(value);
        const keys = Object.keys(value);
        keys.forEach((key) => {
            _freeze(value[key], processedValues);
        });
        Object.freeze(value);
    }
    return value;
}

function _getArrayFromObject(keys: string[], obj: {[key: string]: any}): any[] {
    return keys.map((key) => obj[key]);
}

function _getEmbededError(
    error: any, message: string, state: {[key: string]: any}, structure: {[key: string]: any},
): any {
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

function _getCompleteDeclarativeConfig(partialConfig: Partial<IUserDeclarativeConfig>): IDeclarativeConfig {
    const defaultDeclarativeConfig = {
        ins: null,
        out: null,
        injection: {},
        component: {},
        bootstrap: "main",
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

function _getCompleteComponent(partialComponent: Partial<IUserComponent>): IComponent {
    const defaultComponent = {
        ins: null,
        out: null,
        perform: null,
        parts: [],
    };
    const filledComponent = Object.assign({}, defaultComponent, partialComponent) as IComponent;
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
