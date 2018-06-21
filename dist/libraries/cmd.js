"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const stringUtil_1 = require("./stringUtil");
function cmd(command, options) {
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            return resolve(stdout);
        });
        subProcess.stdout.on("data", (chunk) => {
            process.stderr.write("\x1b[33m" + String(chunk) + "\x1b[0m");
        });
        subProcess.stderr.on("data", (chunk) => {
            process.stderr.write("\x1b[31m" + String(chunk) + "\x1b[0m");
        });
        function stdinListener(chunk) {
            subProcess.stdin.write(chunk);
        }
        process.stdin.on("data", stdinListener);
        subProcess.stdin.on("end", () => {
            process.stdin.removeListener("data", stdinListener);
            process.stdin.end();
        });
        subProcess.stdin.on("error", (error) => console.error(error));
        process.stdin.on("error", (error) => console.error(error));
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
function runCompiledChiml(scriptPath, ins) {
    try {
        const mainFunction = require(scriptPath);
        return mainFunction(...ins);
    }
    catch (error) {
        return Promise.reject(error);
    }
}
function cmdComposedCommand(command, ins = [], opts, isCompiled = false) {
    if (isCompiled) {
        const commandParts = stringUtil_1.smartSplit(command, " ").filter((part) => part !== "");
        if (commandParts.length > 1 && commandParts[0] === "chie") {
            const chimlPath = commandParts[1];
            const scriptPath = chimlPath.replace(/^(.*)\.chiml$/gmi, (match, fileName) => {
                if ("cwd" in opts && opts.cwd !== null && !path_1.isAbsolute(chimlPath)) {
                    const cwd = opts.cwd;
                    return path_1.resolve(cwd, `${fileName}.js`);
                }
                return `${fileName}.js`;
            });
            if (chimlPath !== scriptPath) {
                const inputs = commandParts.slice(2).concat(ins);
                return runCompiledChiml(scriptPath, inputs);
            }
        }
    }
    return cmd(composeCommand(command, ins), opts).then((result) => {
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
//# sourceMappingURL=cmd.js.map