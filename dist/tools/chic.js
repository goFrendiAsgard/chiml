#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "../package.json" }).start();
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
//# sourceMappingURL=chic.js.map