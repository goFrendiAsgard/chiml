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
 * wrap
 *********************************************************/

// promise
export function wrap<TResult1>(
    p1: Promise<TResult1>,
): () => Promise<[TResult1]>;

// function with callback
export function wrap<TResult>(
    fn: (cb: (error: any, result: TResult) => any) => any,
): () => Promise<TResult>;
export function wrap<TResult extends any[]>(
    fn: (cb: (error: any, ...result: TResult) => any) => any,
): () => Promise<TResult>;

export function wrap<TA1, TResult>(
    fn: (a1: TA1, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1) => Promise<TResult>;
export function wrap<TA1, TA2, TResult extends any[]>(
    fn: (a1: TA1, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1) => Promise<TResult>;

export function wrap<TA1, TA2, TResult>(
    fn: (a1: TA1, a2: TA2, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2) => Promise<TResult>;
export function wrap<TA1, TA2, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2) => Promise<TResult>;

export function wrap<TA1, TA2, TA3, TResult>(
    fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3) => Promise<TResult>;
export function wrap<TA1, TA2, TA3, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3) => Promise<TResult>;

export function wrap<TA1, TA2, TA3, TA4, TResult>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4) => Promise<TResult>;
export function wrap<TA1, TA2, TA3, TA4, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4) => Promise<TResult>;

export function wrap<TA1, TA2, TA3, TA4, TA5, TResult>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5) => Promise<TResult>;
export function wrap<TA1, TA2, TA3, TA4, TA5, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, ...result: TResult) => any) => any,
): (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5) => Promise<TResult>;

// async function
export function wrap<TArgs extends any[], TResult extends IValue>(
    fn: (...args: TArgs) => TResult): (...args: TArgs) => TResult;

// sync function
export function wrap<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => TResult): (...args: TArgs) => Promise<TResult>;

// command and everything else
export function wrap(arg: any): IWrappedFunction;

// real implementation
export function wrap(arg: any): IWrappedFunction {
    if (isPromise(arg)) {
        return () => arg as IValue;
    }
    return createCmdOrFunctionResolver(arg as string| IAnyFunction);
}

/*********************************************************
 * curry
 *********************************************************/

export function curry(action: any, limit: number, ...injectArgs: any[]): IWrappedFunction {
    const func = wrap(action);
    return async (...args: any[]) => {
        const newArgs = injectArgs.concat(args);
        return func(...newArgs);
    };
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
export function map(funcOrCmd: any): IMapFunction;

// real implementation
export function map(funcOrCmd: string | IAnyFunction | IValue): IMapFunction {
    return (args: any[]) => {
        const promises: IValue[] = args.map(
            async (element) => wrap(funcOrCmd)(element),
        );
        return Promise.all(promises);
    };
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
export function filter(funcOrCmd: any): IFilterFunction;

// real implementation
export function filter(funcOrCmd: string | IAnyFunction | IValue): IFilterFunction {
    return (args: any[]): IValue => {
        const promises: IValue[] = args.map(
            (element) => wrap(funcOrCmd)(element),
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
    };
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
export function reduce<TArg, TResult extends any>(
    cmd: string): (accumulator: TResult, args: TArg[]) => Promise<TResult>;
export function reduce(funcOrCmd: any): IReduceFunction;

// real implementation
export function reduce(funcOrCmd: any): IReduceFunction {
    return async (accumulator: any, args: any[]) => {
        let result: any = accumulator;
        for (const arg of args) {
            result = await wrap(funcOrCmd)(arg, result);
        }
        return result;
    };
}

/*********************************************************
 * pipe
 *********************************************************/

export function pipe(...actions: any[]): IWrappedFunction {
    return async (...args: any[]) => {
        let result: IValue = Promise.resolve(null);
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            if (i === 0) {
                result = wrap(action)(...args);
                continue;
            }
            result = result.then((arg) => wrap(action)(arg));
        }
        return result;
    };
}

/*********************************************************
 * parallel
 *********************************************************/

export function parallel(...actions: IValue[]): IWrappedFunction {
    return () => Promise.all(actions);
}

/*********************************************************
 * private functions
 *********************************************************/

function createCmdOrFunctionResolver(cmdOrFunc: IAnyFunction | string): IWrappedFunction {
    if (typeof cmdOrFunc === "string") {
        return createCmdResolver(cmdOrFunc);
    }
    return createFunctionResolver(cmdOrFunc);
}

function createCmdResolver(cmd: string): IWrappedFunction {
    return (...args: any[]): IValue => {
        const command = composeCommand(cmd, args);
        return runCommand(command);
    };
}

function createFunctionResolver(func: IAnyFunction): IWrappedFunction {
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
            args.push(callback);
            try {
                const functionResult = func(...args);
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
