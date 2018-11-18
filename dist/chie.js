#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const index_1 = require("./index");
if (require.main === module) {
    const rawArgs = process.argv.slice(2);
    let injectionFile = null;
    let yamlFile = null;
    let args = [];
    if (rawArgs.length === 0) {
        console.error("Parameter expected");
    }
    else {
        if (rawArgs.length === 1) {
            // CASE: chie program.yaml
            yamlFile = rawArgs[0];
        }
        else {
            if (rawArgs[1].match(/.*\.yml$/gi)) {
                // CASE: chie injection.js program.yaml arg1 arg2 ...argn
                [injectionFile, yamlFile, ...args] = rawArgs;
            }
            else {
                // CASE: chie program.yaml arg1 arg2 ...argn
                [yamlFile, ...args] = rawArgs;
            }
        }
        const yamlScript = fs_1.readFileSync(yamlFile).toString();
        const config = js_yaml_1.safeLoad(yamlScript);
        // define config.injection
        if (injectionFile === null && config.injection && config.injection[0] === ".") {
            const dirname = path_1.resolve(path_1.dirname(yamlFile));
            injectionFile = path_1.join(dirname, config.injection);
        }
        if (injectionFile) {
            config.injection = require(injectionFile);
        }
        else {
            config.injection = {};
        }
        // get bootstrap and run it
        const bootstrap = index_1.X.declarative(config);
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