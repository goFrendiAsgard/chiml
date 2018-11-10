"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const R = require("ramda");
const BRIGHT = "\x1b[1m";
// const FG_BLUE = "\x1b[34m";
// const FG_CYAN = "\x1b[36m";
const FG_RED = "\x1b[31m";
// const FG_WHITE = "\x1b[37m";
const FG_YELLOW = "\x1b[33m";
const RESET_COLOR = "\x1b[0m";
exports.X = Object.assign({}, R, {
    declarative,
    foldInput,
    spreadInput,
    parallel,
    wrapCommand,
    wrapNodeback,
    wrapSync,
});
function declarative(declarativeConfig) {
    const { comp, main } = declarativeConfig;
    const defaultAction = "<identity>";
    const dictionary = Object.assign({}, declarativeConfig.vals);
    const compKeys = Object.keys(comp);
    // parse all `<key>`, create function, and register it to dictionary
    for (const key in comp) {
        if (!(key in comp)) {
            continue;
        }
        const { pipe, vals } = comp[key];
        const parsedVals = getParsedCompVals(vals, dictionary);
        const factory = dictionary[pipe];
        const fn = factory(...parsedVals);
        dictionary[key] = fn;
    }
    return (...args) => {
        if (main in dictionary) {
            const mainFunction = dictionary[main];
            return mainFunction(...args);
        }
        throw (new Error(`${main} is not defined`));
    };
}
function getParsedCompVals(vals, dictionary) {
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
            throw (new Error(`<${key}> is not found`));
        }
        return vals;
    }
    return vals;
}
function spreadInput(fn) {
    function func(...args) {
        return fn(args);
    }
    return func;
}
function foldInput(fn) {
    function func(arr) {
        return fn(...arr);
    }
    return func;
}
function parallel(...fnList) {
    function func(...args) {
        const promises = fnList.map((fn) => fn(...args));
        return Promise.all(promises);
    }
    return func;
}
function wrapSync(fn) {
    function func(...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(fn(...args));
        });
    }
    return func;
}
function wrapCommand(stringCommand) {
    function func(...args) {
        const composedStringCommand = getEchoPipedStringCommand(stringCommand, args);
        return runStringCommand(composedStringCommand);
    }
    return func;
}
function wrapNodeback(fn) {
    function func(...args) {
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
function runStringCommand(stringCommand, options) {
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(stringCommand, options, (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            try {
                return resolve(JSON.parse(stdout));
            }
            catch (error) {
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
function getEchoPipedStringCommand(strCmd, ins) {
    if (ins.length === 0) {
        return strCmd;
    }
    const echoes = ins.map((element) => "echo " + getDoubleQuotedString(String(element))).join(" && ");
    const commandWithParams = getStringCommandWithParams(strCmd, ins);
    const composedCommand = `(${echoes}) | ${commandWithParams}`;
    return composedCommand;
}
function getStringCommandWithParams(strCmd, ins) {
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
function getNewStdinListener(subProcess) {
    return (chunk) => subProcess.stdin.write(chunk);
}
function getDoubleQuotedString(str) {
    const newStr = str.replace(/"/g, "\\\"");
    return `"${newStr}"`;
}
//# sourceMappingURL=index.js.map