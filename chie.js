#! /usr/bin/env node

const { X } = require("./dist/index.js");
const fs = require("fs");
const jsYaml = require("js-yaml");
const path = require("path");

if (require.main === module) {
    const rawArgs = process.argv.slice(2);
    let injectionFile = null;
    let yamlFile = null;
    let args = [];
    if (rawArgs.length === 0) {
        console.error("Parameter expected");
    } else {
        if (rawArgs.length === 1) {
            // CASE: chie program.yaml
            yamlFile = rawArgs[0];
        } else {
            if (rawArgs[1].match(/.*\.yml$/gi)) {
                // CASE: chie injection.js program.yaml arg1 arg2 ...argn
                [injectionFile, yamlFile, ...args] = rawArgs;
            } else {
                // CASE: chie program.yaml arg1 arg2 ...argn
                [yamlFile, ...args] = rawArgs;
            }
        }
        const yamlScript = fs.readFileSync(yamlFile).toString();
        const config = jsYaml.safeLoad(yamlScript);
        // define config.injection
        if (injectionFile === null && config.injection) {
            const dirname = path.dirname(yamlFile);
            injectionFile = path.join(dirname, config.injection);
        }
        if (injectionFile) {
            config.injection = require(injectionFile);
        } else {
            config.injection = {};
        }
        // get bootstrap and run it
        const bootstrap = X.declarative(config);
        const result = bootstrap(...args);
        if ('then' in result) {
            result
                .then((realResult) => console.log(realResult))
                .catch((error) => console.error(error));
        } else {
            console.log(result);
        }
    }
}
