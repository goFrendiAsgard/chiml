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
    const containerFile = options.c || options.container || null;
    if (containerFile === null) {
        console.error("Container expected");
    }
    else {
        // get bootstrap and run it
        const bootstrap = index_1.execute(containerFile, injectionFile);
        const result = bootstrap(...args);
        if ("then" in result) {
            result
                .then((realResult) => console.log(realResult))
                .catch((error) => console.error(error));
        }
        else {
            console.log(result);
        }
    }
}
//# sourceMappingURL=chie.js.map