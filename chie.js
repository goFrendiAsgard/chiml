#! /usr/bin/env node
const { readFile } = require("fs");
const { ModuleKind, ScriptTarget, transpileModule } = require("typescript");
const { runInThisContext } = require("vm");
const { X } = require("./dist/index.js");

async function _main(fileName, parameters) {
    const compilerOptions = {
        module: ModuleKind.CommonJS,
        target: ScriptTarget.ES5,
    };
    try {
        const tsCodeBuffer = await X.wrapNodeback(readFile)(fileName);
        const tsCode = tsCodeBuffer.toString();
        const jsCode = await transpileModule(tsCode, compilerOptions);
        const vmResult = runInThisContext(jsCode);
        return main(args);
    } catch (error) {
        return console.error(error);
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        return console.error("Parameter expected");
    }
    const [ fileName, ...parameters ] = args;
    _main(fileName, parameters);
}
