#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
if (require.main === module) {
    const args = process.argv.slice(2);
    const fileGetter = args.length < 1 ? index_1.getFiles(".") : Promise.resolve(args);
    fileGetter
        .then((files) => {
        return index_1.compile(files);
    })
        .then((jsFilePaths) => {
        const createdFileList = jsFilePaths.map((filePath) => {
            return "- " + filePath;
        }).join("\n");
        console.log(`JavaScript file created:\n${createdFileList}`);
    })
        .catch((error) => {
        console.error(error);
    });
}
//# sourceMappingURL=chic.js.map