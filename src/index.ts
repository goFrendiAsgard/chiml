import { ChildProcess, exec } from "child_process";
import {
    IAnyFunction, IFilterFunction, IMapFunction,
    IReduceFunction, IValue, IWrappedFunction,
} from "./interfaces";

const BRIGHT = "\x1b[1m";
// const FG_BLUE = "\x1b[34m";
// const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
// const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";

/*********************************************************
 * placeHolder
 *********************************************************/
export const _ = { __isPlaceHolder: true };

/*********************************************************
 * wrap
 *********************************************************/

// promise
export function wrap<TResult1>(
    p1: Promise<TResult1>,
): () => Promise<[TResult1]>;

// function with callback, no parameters
export function wrap<TResult>(
    fn: (cb: (error: any, result: TResult) => any) => any,
): () => Promise<TResult>;
export function wrap<TResult extends any[]>(
    fn: (cb: (error: any, ...result: TResult) => any) => any,
): () => Promise<TResult>;

// function with callback, single parameter
export function wrap<TA1, TResult>(
    fn: (a1: TA1, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1) => Promise<TResult>;
export function wrap<TA1, TA2, TResult extends any[]>(
    fn: (a1: TA1, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1) => Promise<TResult>;

// function with callback, two parameters
export function wrap<TA1, TA2, TResult>(
    fn: (a1: TA1, a2: TA2, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2) => Promise<TResult>;
export function wrap<TA1, TA2, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2) => Promise<TResult>;

// function with callback, three parameters
export function wrap<TA1, TA2, TA3, TResult>(
    fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3) => Promise<TResult>;
export function wrap<TA1, TA2, TA3, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3) => Promise<TResult>;

// function with callback, four parameters
export function wrap<TA1, TA2, TA3, TA4, TResult>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4) => Promise<TResult>;
export function wrap<TA1, TA2, TA3, TA4, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4) => Promise<TResult>;

// function with callback, five parameters
export function wrap<TA1, TA2, TA3, TA4, TA5, TResult>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5) => Promise<TResult>;
export function wrap<TA1, TA2, TA3, TA4, TA5, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5) => Promise<TResult>;

// async function
export function wrap<TArgs extends any[], TResult extends IValue>(
    fn: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult;

// sync function
export function wrap<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => TResult,
): (...args: TArgs) => Promise<TResult>;

// command and everything else
export function wrap(arg: any): IWrappedFunction;

// real implementation
export function wrap(cmdOrFunc: any): IWrappedFunction {
    return internalWrap(cmdOrFunc);
}

/*********************************************************
 * pipe
 *********************************************************/
export function pipe(...actions: any[]): IWrappedFunction {
    return internalPipe(...actions);
}

/*********************************************************
 * compose
 *********************************************************/
export function compose(...actions: any[]): IWrappedFunction {
    const newActions = actions.reverse();
    return pipe(...newActions);
}

/*********************************************************
 * curryLeft
 *********************************************************/
export function curryLeft(fn: any, arity): IAnyFunction | IWrappedFunction {
    return internalCurry(fn, arity, [], "left");
}
export const curry = curryLeft;

/*********************************************************
 * curryRight
 *********************************************************/
export function curryRight(fn: any, arity): IAnyFunction | IWrappedFunction {
    return internalCurry(fn, arity, [], "right");
}

/*********************************************************
 * map
 *********************************************************/

// async & sync function
export function map<TArg, TResult>(
    func: (arg: TArg) => Promise<TResult>|TResult,
): (args: TArg[]) => Promise<TResult>;

// function that have callback
export function map<TArg, TResult, TCallback extends(error: any, result: TResult) => any>(
    func: (arg: TArg, cb: TCallback) => any,
): (args: TArg[]) => Promise<TResult>;

// any others
export function map(funcOrCmd: any): IMapFunction;

// real implementation
export function map(funcOrCmd: any): IMapFunction {
    return internalMap(funcOrCmd);
}

/*********************************************************
 * filter
 *********************************************************/

// async & sync function
export function filter<TArg, TResult extends TArg[]>(
    func: (arg: TArg) => Promise<TResult>|TResult,
): (args: TArg[]) => Promise<TResult>;

// function that have callback
export function filter<TArg, TResult, TCallback extends(error: any, result: boolean) => any>(
    func: (arg: TArg, cb: TCallback) => any,
): (args: TArg[]) => Promise<TResult>;

// any others
export function filter(funcOrCmd: any): IFilterFunction;

// real implementation
export function filter(funcOrCmd: any): IFilterFunction {
    return internalFilter(funcOrCmd);
}

/*********************************************************
 * reduce
 *********************************************************/

// async & sync function
export function reduce<TArg, TResult>(
    func: (arg: TArg, accumulator: TResult) => Promise<TResult>|TResult,
): (accumulator: TResult, args: TArg[]) => Promise<TResult>;

// function that have callback
export function reduce<TArg, TResult, TCallback extends(error: any, result: TResult) => any>(
    func: (accumulator: TResult, args: TArg[]) => any,
): (args: TArg[], accumulator: TResult) => Promise<TResult>;

// cmd
export function reduce<TArg, TResult extends any>(
    cmd: string,
): (accumulator: TResult, args: TArg[]) => Promise<TResult>;

// any others
export function reduce(funcOrCmd: any): IReduceFunction;

// real implementation
export function reduce(funcOrCmd: any): IReduceFunction {
    return internalReduce(funcOrCmd);
}

/*********************************************************
 * parallel
 *********************************************************/
export function parallel(...funcOrCmds: any[]): IWrappedFunction {
    return internalParallel(...funcOrCmds);
}

/*********************************************************
 * private functions
 *********************************************************/

function isPlaceHolder(obj: any) {
   return typeof obj === "object" && obj && obj.__isPlaceHolder;
}

function isWrappedFunction(func: any) {
    return (typeof func === "object" || typeof func === "function") && "__isWrapped" in func;
}

function internalWrap(cmdOrFunc: any): IWrappedFunction {
    // if function is already wrapped, just return it without any modification
    if (isWrappedFunction(cmdOrFunc)) {
        return cmdOrFunc;
    }
    // Otherwise, create resolver and mark it as wrapped object
    let func: IWrappedFunction;
    if (isPromise(cmdOrFunc)) {
        func = (() => cmdOrFunc) as IWrappedFunction;
    } else if (typeof cmdOrFunc === "string") {
        func = createCmdResolver(cmdOrFunc) as IWrappedFunction;
    } else {
        func = createFunctionResolver(cmdOrFunc) as IWrappedFunction;
    }
    func.__isWrapped = true;
    return func;
}

function internalCurry(fn, arity, memo, mode) {
    return (...args) => {
        let argIndex = 0;
        // newArgs is memo with all placeHolder replaced by args's element
        let newArgs = memo.map((arg) => {
            if (isPlaceHolder(arg) && argIndex < args.length) {
                const val = args[argIndex];
                argIndex ++;
                return val;
            }
            return arg;
        });
        for (let i = argIndex; i < args.length; i++) {
            newArgs.push(args[i]);
        }
        const isPlaceHolderFound = newArgs.filter(isPlaceHolder).length > 0;
        // no placeholder found and newArgs's count is greater than arity
        if (!isPlaceHolderFound && (newArgs.length >= arity)) {
            if (mode !== "left") {
                newArgs = newArgs.reverse();
            }
            const newFn = internalWrap(fn);
            return newFn(...newArgs);
        }
        return internalCurry(fn, arity, newArgs, mode);
    };
}

function internalPipe(...actions: any[]): IWrappedFunction {
    async function piped(...args: any[]) {
        let result: IValue = Promise.resolve(null);
        for (let i = 0; i < actions.length; i++) {
            const action = internalWrap(actions[i]);
            if (i === 0) {
                result = await action(...args);
                continue;
            }
            result = await action(result);
        }
        return result;
    }
    piped.__isWrapped = true;
    return piped;
}

function internalMap(funcOrCmd: any): IMapFunction {
    async function mapped(args: any[]) {
        const func = internalWrap(funcOrCmd);
        const promises: IValue[] = args.map(
            async (element) => func(element),
        );
        return Promise.all(promises);
    }
    mapped.__isWrapped = true;
    return mapped;
}

function internalFilter(funcOrCmd: any): IFilterFunction {
    async function filtered(args: any[]): IValue {
        const func = internalWrap(funcOrCmd);
        const promises: IValue[] = args.map(
            (element) => func(element),
        );
        return Promise.all(promises)
            .then((filteredList: boolean[]) => {
                const result: any[] = [];
                for (let i = 0; i < filteredList.length; i++) {
                    if (filteredList[i]) {
                        result.push(args[i]);
                    }
                }
                return result;
            });
    }
    filtered.__isWrapped = true;
    return filtered;
}

function internalReduce(funcOrCmd: any): IReduceFunction {
    async function reduced(accumulator: any, args: any[]) {
        const func = internalWrap(funcOrCmd);
        let result: any = accumulator;
        for (const arg of args) {
            result = await func(arg, result);
        }
        return result;
    }
    reduced.__isWrapped = true;
    return reduced;
}

function internalParallel(...funcOrCmds: any[]): IWrappedFunction {
    function paralleled(...args: any[]) {
        const promises = funcOrCmds.map((funcOrCmd) => {
            if (isPromise(funcOrCmd)) {
                return funcOrCmd;
            }
            const func = internalWrap(funcOrCmd);
            return func(...args);
        });
        return Promise.all(promises);
    }
    paralleled.__isWrapped = true;
    return paralleled;
}

function createCmdResolver(cmd: string): IAnyFunction {
    return (...args: any[]): IValue => {
        const command = composeCommand(cmd, args);
        return runCommand(command);
    };
}

function createFunctionResolver(func: IAnyFunction): IAnyFunction {
    return (...args: any[]): IValue => {
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
            try {
                const functionResult = func(...newArgs);
                if (isPromise(functionResult)) {
                    functionResult.then(resolve).catch(reject);
                } else if (typeof functionResult !== "undefined") {
                    resolve(functionResult);
                }
            } catch (error) {
                reject(error);
            }
        });
    };
}

/**
 * @param arg
 * @description return boolean value representing whether the `arg` is a `Promise` or not
 */
function isPromise(arg: any): boolean {
    return arg && arg.then ? true : false;
}

function runCommand(command: string, options?: { [key: string]: any }): IValue {
    return new Promise((resolve, reject) => {
        const subProcess = exec(command, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            try {
                return resolve(JSON.parse(stdout));
            } catch (error) {
                return resolve(stdout.trim());
            }
        });

        subProcess.stdout.on("data", (chunk) => {
            process.stderr.write(BRIGHT + FG_YELLOW);
            process.stderr.write(String(chunk));
            process.stderr.write(RESET_COLOR);
        });

        subProcess.stderr.on("data", (chunk) => {
            process.stderr.write(BRIGHT + FG_RED);
            process.stderr.write(String(chunk));
            process.stderr.write(RESET_COLOR);
        });

        const stdinListener = createStdInListener(subProcess);

        process.stdin.on("data", stdinListener);
        subProcess.stdin.on("end", () => {
            process.stdin.removeListener("data", stdinListener);
            process.stdin.end();
        });
        subProcess.stdin.on("error", (error) => console.error(error));
        process.stdin.on("error", (error) => console.error(error));

    });
}

function composeCommand(command: string, ins: any[]): string {
    if (ins.length === 0) {
        return command;
    }
    const echoes = ins.map((element) => "echo " + doubleQuote(String(element))).join(" && ");
    const commandWithParams = getCommandWithParams(command, ins);
    const composedCommand = `(${echoes}) | ${commandWithParams}`;
    return composedCommand;
}

function getCommandWithParams(command: string, ins: any[]): string {
    // command has no templated parameters
    if (command.match(/.*\$\{[0-9]+\}.*/g)) {
        // command has templated parameters (i.e: ${1}, ${2}, etc)
        let commandWithParams = command;
        for (let i = 0; i < ins.length; i++) {
            const paramIndex = i + 1;
            commandWithParams = commandWithParams.replace(`$\{${paramIndex}}`, doubleQuote(String(ins[i])));
        }
        return commandWithParams;
    }
    const inputs = ins.map((element) => doubleQuote(String(element))).join(" ");
    return `${command} ${inputs}`;
}

function createStdInListener(subProcess: ChildProcess): (chunk: any) => void {
    return (chunk) => subProcess.stdin.write(chunk);
}

function doubleQuote(str: string): string {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
