#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
function main(args) {
    const fileGetter = args.length < 1 ? index_1.getFiles(".") : Promise.resolve(args);
    const logger = new index_1.Logger();
    fileGetter
        .then((files) => {
        return index_1.compile(files);
    })
        .then((jsFilePaths) => {
        const createdFileList = jsFilePaths.map((filePath) => {
            return "- " + filePath;
        }).join("\n");
        logger.log(`JavaScript file created:\n${createdFileList}`);
    })
        .catch((error) => {
        logger.error(error);
    });
}
if (require.main === module) {
    const args = process.argv.slice(2);
    main(args);
}
