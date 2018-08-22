import chalk from "chalk";
import { exec } from "child_process";
import { isAbsolute as isAbsolutePath, resolve as pathResolve } from "path";
import { Logger } from "../classes/Logger";
import { ILogger } from "../interfaces/ILogger";
import { doubleQuote, smartSplit } from "./stringUtil";

const defaultLogger = new Logger();

export function cmd(command: string, options?: { [key: string]: any }): Promise<string> {
    const logger: ILogger = options && "logger" in options ? options.logger : defaultLogger;
    return new Promise((resolve, reject) => {
        const subProcess = exec(command, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            return resolve(stdout);
        });

        subProcess.stdout.on("data", (chunk) => {
            process.stderr.write(chalk.yellowBright(String(chunk)));
        });

        subProcess.stderr.on("data", (chunk) => {
            process.stderr.write(chalk.redBright(String(chunk)));
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

export function composeCommand(command: string, ins: any[] = []): string {
    if (ins.length === 0) {
        return command;
    }
    const echoes = ins.map((element) => "echo " + doubleQuote(String(element))).join(" && ");
    const inputs = ins.map((element) => doubleQuote(String(element))).join(" ");
    const composedCommand = `(${echoes}) | ${command} ${inputs}`;
    return composedCommand;
}

export function cmdComposedCommand(
    command: string, ins: any[] = [], opts?: { [key: string]: any }, isCompiled: boolean = false): Promise<any> {
    if (isCompiled) {
        const commandParts = smartSplit(command, " ").filter((part) => part !== "");
        if (commandParts.length > 1 && commandParts[0] === "chie") {
            const chimlPath = commandParts[1];
            const scriptPath = getChimlCompiledScriptPath(chimlPath, opts.cwd);
            if (chimlPath !== scriptPath) {
                const inputs = commandParts.slice(2).concat(ins);
                return runCompiledChiml(scriptPath, inputs);
            }
        }
    }
    return cmd(composeCommand(command, ins), opts)
        .then((result) => {
            return new Promise((resolve, reject) => {
                try {
                    resolve(JSON.parse(result.trim()));
                } catch (error) {
                    resolve(result.trim());
                }
            });
        });
}

export function getChimlCompiledScriptPath(chimlPath: string, cwd: string) {
    return chimlPath.replace(/^(.*)\.chiml$/gmi, (match, fileName) => {
        if (cwd && !isAbsolutePath(chimlPath)) {
            return pathResolve(cwd, `${fileName}.js`);
        }
        return `${fileName}.js`;
    });
}

function runCompiledChiml(scriptPath, ins: any[]): Promise<any> {
    try {
        const mainFunction = require(scriptPath);
        return mainFunction(...ins);
    } catch (error) {
        return Promise.reject(error);
    }
}

function createStdInListener(subProcess) {
    return (chunk) => subProcess.stdin.write(chunk);
}
