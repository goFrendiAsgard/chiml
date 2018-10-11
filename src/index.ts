import { ChildProcess, exec } from "child_process";
import { IAnyFunction, IChimlResult } from "./interfaces";

const BRIGHT = "\x1b[1m";
// const FG_BLUE = "\x1b[34m";
// const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
// const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";

/*********************************************************
 * chiml
 *********************************************************/

// all are promises
export function chiml<TResult1>(
    p1: Promise<TResult1>,
): Promise<[TResult1]>;
export function chiml<TResult1, TResult2>(
    p1: Promise<TResult1>, p2: Promise<TResult1>,
): Promise<[TResult1, TResult2]>;
export function chiml<TResult1, TResult2, TResult3>(
    p1: Promise<TResult1>, p2: Promise<TResult1>, p3: Promise<TResult3>,
): Promise<[TResult1, TResult2, TResult3]>;
export function chiml<TResult1, TResult2, TResult3, TResult4>(
    p1: Promise<TResult1>, p2: Promise<TResult1>, p3: Promise<TResult3>, p4: Promise<TResult4>,
): Promise<[TResult1, TResult2, TResult3, TResult4]>;
export function chiml<TResult1, TResult2, TResult3, TResult4, TResult5>(
    p1: Promise<TResult1>, p2: Promise<TResult1>, p3: Promise<TResult3>, p4: Promise<TResult4>, p5: Promise<TResult5>,
): Promise<[TResult1, TResult2, TResult3, TResult4, TResult5]>;
export function chiml(...args: IChimlResult[]): IChimlResult;

// async function
export function chiml<TArgs extends any[], TResult extends IChimlResult>(
    fn: (...args: TArgs) => TResult, ...args: TArgs): TResult;

// sync function
export function chiml<TArgs extends any[], TResult extends any>(
    fn: (...args: TArgs) => TResult, ...args: TArgs): Promise<TResult>;

// function with callback
export function chiml<TA1 extends any, TResult extends any>(
    fn: (a1: TA1, cb: (error: any, result: TResult) => any) => any,
    a1: TA1,
): Promise<TResult>;
export function chiml<TA1 extends any, TResult extends any[]>(
    fn: (a1: TA1, cb: (error: any, ...result: TResult) => any) => any,
    a1: TA1,
): Promise<TResult>;
export function chiml<TA1 extends any, TA2 extends any, TResult extends any>(
    fn: (a1: TA1, a2: TA2, cb: (error: any, result: TResult) => any) => any,
    a1: TA1, a2: TA2,
): Promise<TResult>;
export function chiml<TA1 extends any, TA2 extends any, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, cb: (error: any, ...result: TResult) => any) => any,
    a1: TA1, a2: TA2,
): Promise<TResult>;
export function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TResult extends any>(
    fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, result: TResult) => any) => any,
    a1: TA1, a2: TA2, a3: TA3,
): Promise<TResult>;
export function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, cb: (error: any, ...result: TResult) => any) => any,
    a1: TA1, a2: TA2, a3: TA3,
): Promise<TResult>;
export function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TResult extends any>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, result: TResult) => any) => any,
    a1: TA1, a2: TA2, a3: TA3, a4: TA4,
): Promise<TResult>;
export function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, cb: (error: any, ...result: TResult) => any) => any,
    a1: TA1, a2: TA2, a3: TA3, a4: TA4,
): Promise<TResult>;
// tslint:disable-next-line:max-line-length
export function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TA5 extends any, TResult extends any>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, result: TResult) => any) => any,
    a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5,
): Promise<TResult>;
// tslint:disable-next-line:max-line-length
export function chiml<TA1 extends any, TA2 extends any, TA3 extends any, TA4 extends any, TA5 extends any, TResult extends any[]>(
    fn: (a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5, cb: (error: any, ...result: TResult) => any) => any,
    a1: TA1, a2: TA2, a3: TA3, a4: TA4, a5: TA5,
): Promise<TResult>;

// command
export function chiml(cmd: string|any[], ...args: any[]): IChimlResult;

// any other
export function chiml(...args: any[]): IChimlResult;

// real implementation
export function chiml(...args: any[]): IChimlResult {
    const arg = args[0];
    const restArgs = args.slice(1);
    if (isAllPromise(args)) {
        if (args.length === 1) {
            // args only contain a single promise, return it
            return arg;
        }
         // Every element in `args` is Promise, do Promise.all
        return Promise.all(args);
    }
    if (Array.isArray(arg)) {
        return compose(arg, ...restArgs);
    }
    // create resolver and execute the resolver
    const result = resolveCmdOrFunction(arg, ...restArgs);
    return result;
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
export function map<TArg, TResult extends any[]>(cmd: string): (args: TArg[]) => Promise<TResult>;

// real implementation
export function map(funcOrCmd: string|IAnyFunction): (args: any[]) => IChimlResult {
    return (args: any[]) => {
        const promises: IChimlResult[] = args.map(
            (element) => chiml(funcOrCmd, element),
        );
        return Promise.all(promises);
    };
}

/*********************************************************
 * filter
 *********************************************************/

// async & sync function
export function filter<TArg, TResult extends TArg[]>(
    func: (arg: TArg) => Promise<boolean>|boolean,
): (args: TArg[]) => Promise<TResult>;
// function that have callback
export function filter<TArg, TResult, TCallback extends(error: any, result: boolean) => any>(
    func: (arg: TArg, cb: TCallback) => any,
): (args: TArg[]) => Promise<TResult>;
export function filter<TArg, TResult extends any[]>(cmd: string): (args: TArg[]) => Promise<TResult>;

// real implementation
export function filter(funcOrCmd: string|IAnyFunction): (args: any[]) => IChimlResult {
    return (args: any[]) => {
        const promises: IChimlResult[] = args.map(
            (element) => chiml(funcOrCmd, element),
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
): (args: TArg[], accumulator: TResult) => Promise<TResult>;
// function that have callback
export function reduce<TArg, TResult, TCallback extends(error: any, result: TResult) => any>(
    func: (arg: TArg, accumulator: TResult, cb: TCallback) => any,
): (args: TArg[], accumulator: TResult) => Promise<TResult>;
export function reduce<TArg, TResult extends any[]>(
    cmd: string): (args: TArg[], accumulator: TResult) => Promise<TResult>;

// real implementation
export function reduce(funcOrCmd: string|IAnyFunction): (arg: any[], accumulator: any) => IChimlResult {
    return async (args: any[], accumulator: any) => {
        let result: any = accumulator;
        for (const arg of args) {
            result = await chiml(funcOrCmd, arg, result);
        }
        return result;
    };
}

/*********************************************************
 * private functions
 *********************************************************/

function compose(rawActions: any[], ...args: any[]): IChimlResult {
    const actions = rawActions.reverse();
    let result: IChimlResult = Promise.resolve(null);
    for (let i = 0; i < args.length; i++) {
        const action = actions[i];
        if (i === 0) {
            result = chiml(action, ...args);
            continue;
        }
        result = result.then((arg) => chiml(action, arg));
    }
    return result;
}

function resolveCmdOrFunction(func: any, ...args: any[]): any|IChimlResult {
    if (typeof func === "string") {
        const command = composeCommand(func, args);
        return runCommand(command);
    }
    if (typeof func === "function") {
        return resolveFunction(func, ...args);
    }
}

function resolveFunction(func: (...args: any[]) => any, ...args: any[]): IChimlResult {
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
}

function isAllPromise(args: any[]): boolean {
    for (const arg of args) {
        if (!isPromise(arg)) {
            return false;
        }
    }
    return true;
}

/**
 * @param arg
 * @description return boolean value representing whether the `arg` is a `Promise` or not
 */
function isPromise(arg: any): boolean {
    return arg && arg.then ? true : false;
}

function runCommand(command: string, options?: { [key: string]: any }): IChimlResult {
    const logger: Console = options && options.logger || console;
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
        subProcess.stdin.on("error", (error) => logger.error(error));
        process.stdin.on("error", (error) => logger.error(error));

    });
}

function composeCommand(command: string, ins: any[] = []): string {
    if (ins.length === 0) {
        return command;
    }
    const echoes = ins.map((element) => "echo " + doubleQuote(String(element))).join(" && ");
    const inputs = ins.map((element) => doubleQuote(String(element))).join(" ");
    const composedCommand = `(${echoes}) | ${command} ${inputs}`;
    return composedCommand;
}

function createStdInListener(subProcess: ChildProcess): (chunk: any) => void {
    return (chunk) => subProcess.stdin.write(chunk);
}

function doubleQuote(str: string): string {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
