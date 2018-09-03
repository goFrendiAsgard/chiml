#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cache-require-paths");
const Logger_1 = require("../classes/Logger");
const tools_1 = require("../libraries/tools");
function main(args) {
    const fileGetter = args.length < 1 ? tools_1.getFiles(".") : Promise.resolve(args);
    const logger = new Logger_1.Logger();
    fileGetter
        .then((files) => {
        return tools_1.compile(files);
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
//# sourceMappingURL=chic.js.map