#! /usr/bin/env node

const { X } = require("./dist/index.js");
const jsYaml = require("js-yaml");
const fs = require("fs");

if (require.main === module) {
    const rawArgs = process.argv.slice(2);
    const [injectionFile, yamlFile, ...args] = rawArgs;
    const yamlScript = fs.readFileSync(yamlFile).toString();
    const config = jsYaml.safeLoad(yamlScript);
    config.injection = require(injectionFile);
    const bootstrap = X.declarative(config);
    const result = bootstrap(...args);
    if ('then' in result) {
        result.then((realResult) => console.log(realResult));
    } else {
        console.log(result);
    }
}
