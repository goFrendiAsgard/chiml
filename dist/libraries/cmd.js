"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const Logger_1 = require("../classes/Logger");
const stringUtil_1 = require("./stringUtil");
const BRIGHT = "\x1b[1m";
const FG_BLUE = "\x1b[34m";
const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
const defaultLogger = new Logger_1.Logger();
function cmd(command, options) {
    const logger = options && "logger" in options ? options.logger : defaultLogger;
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            return resolve(stdout);
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
exports.cmd = cmd;
function composeCommand(command, ins = []) {
    if (ins.length === 0) {
        return command;
    }
    const echoes = ins.map((element) => "echo " + stringUtil_1.doubleQuote(String(element))).join(" && ");
    const inputs = ins.map((element) => stringUtil_1.doubleQuote(String(element))).join(" ");
    const composedCommand = `(${echoes}) | ${command} ${inputs}`;
    return composedCommand;
}
exports.composeCommand = composeCommand;
function cmdComposedCommand(command, ins = [], opts, isCompiled = false) {
    if (isCompiled) {
        const commandParts = stringUtil_1.smartSplit(command, " ").filter((part) => part !== "");
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
            }
            catch (error) {
                resolve(result.trim());
            }
        });
    });
}
exports.cmdComposedCommand = cmdComposedCommand;
function getChimlCompiledScriptPath(chimlPath, cwd) {
    return chimlPath.replace(/^(.*)\.chiml$/gmi, (match, fileName) => {
        if (cwd && !path_1.isAbsolute(chimlPath)) {
            return path_1.resolve(cwd, `${fileName}.js`);
        }
        return `${fileName}.js`;
    });
}
exports.getChimlCompiledScriptPath = getChimlCompiledScriptPath;
function runCompiledChiml(scriptPath, ins) {
    try {
        const mainFunction = require(scriptPath);
        return mainFunction(...ins);
    }
    catch (error) {
        return Promise.reject(error);
    }
}
function createStdInListener(subProcess) {
    return (chunk) => subProcess.stdin.write(chunk);
}
//# sourceMappingURL=cmd.js.map