import { ChildProcess, exec } from "child_process";
import {
    IAnyFunction, IFilterFunction, IMapFunction,
    IReduceFunction, IWrappedFunction,
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
export function wrap(cmdOrFunc: any): IWrappedFunction {
    return internalCurry(cmdOrFunc, 0, [], "left");
}

/*********************************************************
 * curryLeft & curry
 *********************************************************/
export function curryLeft(fn: any, arity): IWrappedFunction {
    return internalCurry(fn, arity, [], "left");
}
export const curry = curryLeft;

/*********************************************************
 * curryRight
 *********************************************************/
export function curryRight(fn: any, arity): IWrappedFunction {
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
 * pipe
 *********************************************************/
export function pipe(...actions: any[]): IWrappedFunction {
    return callInternal(actions, internalPipe);
}

/*********************************************************
 * compose
 *********************************************************/
export function compose(...actions: any[]): IWrappedFunction {
    return callInternal(actions, internalCompose);
}

/*********************************************************
 * parallel
 *********************************************************/
export function parallel(...funcOrCmds: any[]): IWrappedFunction {
    return callInternal(funcOrCmds, internalParallel);
}

/*********************************************************
 * add, subtract, multiply, divide, modulo, negate
 *********************************************************/
export const add = curry((n1: number, n2: number) => n1 + n2, 2);
export const subtract = curry((n1: number, n2: number) => n1 - n2, 2);
export const multiply = curry((n1: number, n2: number) => n1 * n2, 2);
export const divide = curry((n1: number, n2: number) => n1 / n2, 2);
export const modulo = curry((n1: number, n2: number) => n1 % n2, 2);
export const negate = wrap((n: number) => -n);

/*********************************************************
 * and, or, not
 *********************************************************/
export const and = curry((n1: boolean, n2: boolean) => n1 && n2, 2);
export const or = curry((n1: boolean, n2: boolean) => n1 || n2, 2);
export const not = wrap((n: boolean) => !n);

/*********************************************************
 * eq, gt, gte, lt, lte, neq
 *********************************************************/
export const eq = curry((n1: any, n2: any) => n1 === n2, 2);
export const gt = curry((n1: any, n2: any) => n1 > n2, 2);
export const gte = curry((n1: any, n2: any) => n1 >= n2, 2);
export const lt = curry((n1: any, n2: any) => n1 < n2, 2);
export const lte = curry((n1: any, n2: any) => n1 <= n2, 2);
export const neq = curry((n1: any, n2: any) => n1 !== n2, 2);

/*********************************************************
 * T, F
 *********************************************************/
export const F = wrap(() => false);
export const T = wrap(() => true);

/*********************************************************
 * private functions
 *********************************************************/

function callInternal(
    funcOrCmds: any[],
    internalFunction: (args: any[], arity: number) => IWrappedFunction,
): IWrappedFunction {
    if (funcOrCmds.length === 2) {
        const [ realFuncOrCmds, arity ] = funcOrCmds;
        if (Array.isArray(realFuncOrCmds) && Number.isInteger(arity)) {
            return internalFunction(realFuncOrCmds, arity);
        }
    }
    return internalFunction(funcOrCmds, 0);
}

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
    } else if (typeof cmdOrFunc === "function") {
        func = createFunctionResolver(cmdOrFunc) as IWrappedFunction;
    } else {
        func = (() => Promise.resolve(cmdOrFunc)) as IWrappedFunction;
    }
    func.__isWrapped = true;
    return func;
}

function internalCurry(fn, arity, memo, mode): IWrappedFunction {
    function curried(...args) {
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
        const newFn = internalCurry(fn, arity, newArgs, mode) as IWrappedFunction;
        newFn.__isWrapped = true;
        return newFn;
    }
    curried.__isWrapped = true;
    return curried;
}

function internalPipe(actions: any[], arity: number): IWrappedFunction {
    async function piped(...args: any[]) {
        let result: Promise<any> = Promise.resolve(null);
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
    return internalCurry(piped, arity, [], "left");
}

function internalCompose(actions: any[], arity: number): IWrappedFunction {
    return internalPipe(actions.reverse(), arity);
}

function internalMap(funcOrCmd: any): IMapFunction {
    async function mapped(args: any[]) {
        const func = internalWrap(funcOrCmd);
        const promises: Array<Promise<any>> = args.map(
            async (element) => func(element),
        );
        return Promise.all(promises);
    }
    mapped.__isWrapped = true;
    return mapped;
}

function internalFilter(funcOrCmd: any): IFilterFunction {
    async function filtered(args: any[]): Promise<any> {
        const func = internalWrap(funcOrCmd);
        const promises: Array<Promise<any>> = args.map(
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

function internalParallel(funcOrCmds: any[], arity: number): IWrappedFunction {
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
    return (...args: any[]): Promise<any> => {
        const command = composeCommand(cmd, args);
        return runCommand(command);
    };
}

function createFunctionResolver(func: IAnyFunction): IAnyFunction {
    return (...args: any[]): Promise<any> => {
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

function runCommand(command: string, options?: { [key: string]: any }): Promise<any> {
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
