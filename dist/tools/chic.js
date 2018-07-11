#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tools_1 = require("../libraries/tools");
if (require.main === module) {
    const args = process.argv.slice(2);
    const fileGetter = args.length < 1 ? tools_1.getFiles(".") : Promise.resolve(args);
    fileGetter.then((files) => {
        return tools_1.compile(files);
    }).then((jsFilePaths) => {
        const createdFileList = jsFilePaths.map((filePath) => {
            return "- " + filePath;
        }).join("\n");
        console.log(`JavaScript file created:\n${createdFileList}`);
    }).catch((error) => {
        console.error(error);
    });
}
