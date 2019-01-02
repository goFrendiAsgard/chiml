#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const getArgs = require("get-args");
if (require.main === module) {
    const rawArgs = process.argv.slice(2);
    const processedArgs = getArgs(rawArgs);
    const args = processedArgs.arguments;
    const { options } = processedArgs;
    const injectionFile = options.i || options.injection || null;
    const containerFile = options.c || options.container || args.shift() || null;
    if (containerFile === null) {
        throw new Error("Container expected");
    }
    if (typeof containerFile !== "string") {
        throw new Error("Container should be a single valid string");
    }
    // get bootstrap and run it
    const bootstrap = index_1.inject(containerFile, injectionFile);
    const result = bootstrap(...args);
    if (typeof result === "object" && "then" in result) {
        result
            .then((realResult) => console.log(realResult))
            .catch((error) => { throw error; });
    }
    else {
        console.log(result);
    }
}
//# sourceMappingURL=chie.js.map