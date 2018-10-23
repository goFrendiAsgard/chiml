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
export function wrap(cmdOrFunc: any, arity: number = 0): IWrappedFunction | IAnyFunction {
    return internalWrap(cmdOrFunc, arity);
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
export function map(funcOrCmd: any): IMapFunction {
    return internalMap(funcOrCmd);
}

/*********************************************************
 * filter
 *********************************************************/
export function filter(funcOrCmd: any): IFilterFunction {
    return internalFilter(funcOrCmd);
}

/*********************************************************
 * reduce
 *********************************************************/
export function reduce(funcOrCmd: any): IReduceFunction {
    return internalReduce(funcOrCmd);
}

/*********************************************************
 * parallel
 *********************************************************/
export function parallel(...funcOrCmds: any[]): IWrappedFunction | IAnyFunction {
    if (funcOrCmds.length === 2) {
        const [ realFuncOrCmds, arity ] = funcOrCmds;
        if (Array.isArray(realFuncOrCmds) && Number.isInteger(arity)) {
            return internalParallel(realFuncOrCmds, arity);
        }
    }
    return internalParallel(funcOrCmds, 0);
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

function internalWrap(cmdOrFunc: any, arity: number = 0): IWrappedFunction {
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
    } else if (typeof cmdOrFunc === "function") {
        func = createFunctionResolver(cmdOrFunc) as IWrappedFunction;
    } else {
        func = (() => Promise.resolve(cmdOrFunc)) as IWrappedFunction;
    }
    func.__isWrapped = true;
    return internalCurry(func, arity, [], "left") as IWrappedFunction;
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
            const realFn = internalWrap(fn);
            return realFn(...newArgs);
        }
        const newFn = internalCurry(fn, arity, newArgs, mode);
        return newFn;
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
    return internalCurry(reduced, 2, [], "left") as IReduceFunction;
}

function internalParallel(funcOrCmds: any[], arity: number): IWrappedFunction | IAnyFunction {
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
    return internalCurry(paralleled, arity, [], "left");
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
