import { ChildProcess, exec } from "child_process";
import * as R from "ramda";
import { AnyAsyncFunction, AnyFunction, IComponent, IDeclarativeConfig } from "./interfaces/descriptor";

const BRIGHT = "\x1b[1m";
// const FG_BLUE = "\x1b[34m";
// const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
// const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";

export const X = Object.assign({}, R, {
    declarative,
    foldInput,
    spreadInput,
    parallel,
    wrapCommand,
    wrapNodeback,
    wrapSync,
});

function declarative(declarativeConfig: IDeclarativeConfig): AnyFunction {
    const { comp, main } = declarativeConfig;
    const defaultAction = "<identity>";
    const dictionary = { ...declarativeConfig.vals };
    const compKeys = Object.keys(comp);
    // parse all `<key>`, create function, and register it to dictionary
    for (const key in comp) {
        if (!(key in comp)) { continue; }
        const { pipe, vals } = comp[key];
        const parsedVals = getParsedCompVals(vals, dictionary);
        const factory = dictionary[pipe];
        const fn = factory(...parsedVals);
        dictionary[key] = fn;
    }
    return (...args: any[]) => {
        if (main in dictionary) {
            const mainFunction = dictionary[main];
            return mainFunction(...args);
        }
        throw(new Error(`${main} is not defined`));
    };
}

function getParsedCompVals(vals: any, dictionary: {[key: string]: any}) {
    if (Array.isArray(vals)) {
        const newVals = vals.map((element) => getParsedCompVals(element, dictionary));
        return newVals;
    }
    if (typeof vals === "string") {
        const tagPattern = /<(.+)>/gi;
        const match = tagPattern.exec(vals);
        if (match) {
            const key = match[1];
            if (key in dictionary) {
                return dictionary[key];
            }
            throw(new Error(`<${key}> is not found`));
        }
        return vals;
    }
    return vals;
}

function spreadInput<TArg, TResult>(fn: (arr: TArg[]) => TResult): (...args: TArg[]) => TResult {
    function func(...args: TArg[]): TResult {
        return fn(args);
    }
    return func;
}

function foldInput<TArg, TResult>(fn: (...args: TArg[]) => TResult): (arr: TArg[]) => TResult {
    function func(arr: any[]): any {
        return fn(...arr);
    }
    return func;
}

function parallel(...fnList: AnyAsyncFunction[]): AnyAsyncFunction {
    function func(...args: any[]): Promise<any> {
        const promises: Array<Promise<any>> = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return func;
}

function wrapSync<TArg, TResult>(fn: (...args: TArg[]) => TResult): (...args: TArg[]) => Promise<TResult> {
    async function func(...args: TArg[]): Promise<TResult> {
        return Promise.resolve(fn(...args));
    }
    return func;
}

function wrapCommand(stringCommand: string): AnyAsyncFunction {
    function func(...args: any[]): Promise<any> {
        const composedStringCommand = getEchoPipedStringCommand(stringCommand, args);
        return runStringCommand(composedStringCommand);
    }
    return func;
}

function wrapNodeback(fn: AnyFunction): AnyAsyncFunction {
    function func(...args: any[]): Promise<any> {
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
    return func;
}

function runStringCommand(stringCommand: string, options?: { [key: string]: any }): Promise<any> {
    return new Promise((resolve, reject) => {
        const subProcess = exec(stringCommand, options, (error, stdout, stderr) => {
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

        const stdinListener = getNewStdinListener(subProcess);

        process.stdin.on("data", stdinListener);
        subProcess.stdin.on("end", () => {
            process.stdin.removeListener("data", stdinListener);
            process.stdin.end();
        });
        subProcess.stdin.on("error", (error) => console.error(error));
        process.stdin.on("error", (error) => console.error(error));

    });
}

function getEchoPipedStringCommand(strCmd: string, ins: any[]): string {
    if (ins.length === 0) {
        return strCmd;
    }
    const echoes = ins.map((element) => "echo " + getDoubleQuotedString(String(element))).join(" && ");
    const commandWithParams = getStringCommandWithParams(strCmd, ins);
    const composedCommand = `(${echoes}) | ${commandWithParams}`;
    return composedCommand;
}

function getStringCommandWithParams(strCmd: string, ins: any[]): string {
    // command has no templated parameters
    if (strCmd.match(/.*\$\{[0-9]+\}.*/g)) {
        // command has templated parameters (i.e: ${1}, ${2}, etc)
        let commandWithParams = strCmd;
        for (let i = 0; i < ins.length; i++) {
            const paramIndex = i + 1;
            commandWithParams = commandWithParams.replace(`$\{${paramIndex}}`, getDoubleQuotedString(String(ins[i])));
        }
        return commandWithParams;
    }
    const inputs = ins.map((element) => getDoubleQuotedString(String(element))).join(" ");
    return `${strCmd} ${inputs}`;
}

function getNewStdinListener(subProcess: ChildProcess): (chunk: any) => void {
    return (chunk) => subProcess.stdin.write(chunk);
}

function getDoubleQuotedString(str: string): string {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
