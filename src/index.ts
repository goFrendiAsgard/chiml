import { ChildProcess, exec } from "child_process";
import * as R from "ramda";

const BRIGHT = "\x1b[1m";
// const FG_BLUE = "\x1b[34m";
// const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
// const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";

export const X = Object.assign({}, R, {
    convergeInput,
    parallel: R.curry(parallel),
    wrapCommand: R.curry(wrapCommand),
    wrapNodeback: R.curry(wrapNodeback),
    wrapSync: R.curry(wrapSync),
});

function convergeInput(fn: (...args: any[]) => Promise<any>) {
    function func(arr: any[]): Promise<any> {
        return fn(...arr);
    }
    return func;
}

function parallel(arity: number, fnList: Array<(...args: any[]) => Promise<any>>) {
    function func(...args: any[]): Promise<any> {
        const promises: Array<Promise<any>> = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return R.curryN(arity, func);
}

function wrapSync(arity: number, fn: (...args: any[]) => any) {
    async function func(...args: any[]): Promise<any> {
        return Promise.resolve(fn(...args));
    }
    return R.curryN(arity, func);
}

function wrapCommand(arity: number, stringCommand: string): (...args: any[]) => any {
    function func(...args: any[]): Promise<any> {
        const composedStringCommand = getEchoPipedStringCommand(stringCommand, args);
        return runStringCommand(composedStringCommand);
    }
    return R.curryN(arity, func);
}

function wrapNodeback(arity: number, fn: (...args: any[]) => any): (...args: any[]) => any {
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
            if (newArgs.length < arity) {
                newArgs.push(undefined);
            }
            newArgs.push(callback);
            fn(...newArgs);
        });
    }
    return R.curryN(arity, func);
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
