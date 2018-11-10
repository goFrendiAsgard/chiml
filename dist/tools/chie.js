"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const typescript_1 = require("typescript");
const vm_1 = require("vm");
const index_1 = require("../index");
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        return console.error("Parameter expected");
    }
    const [fileName, ...parameters] = args;
    const tsCode = yield index_1.wrapNodeback(fs_1.readFile(fileName));
    const jsCode = yield typescript_1.transpileModule(tsCode);
    vm_1.runInThisContext(jsCode);
    main(args);
}
