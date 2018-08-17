#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
function main(args) {
    if (args.length < 1) {
        return console.error("Expect more than one parameter(s): `chiml script/file` and `inputs`");
    }
    return index_1.execute(...args)
        .then((result) => {
        console.log(result);
    })
        .catch((error) => {
        console.error(error);
    });
}
if (require.main === module) {
    const args = process.argv.slice(2);
    main(args);
}
