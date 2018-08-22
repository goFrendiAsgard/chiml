#! /usr/bin/env node
import { compile, getFiles, Logger } from "../index";

function main(args: any[]) {
    const fileGetter = args.length < 1 ? getFiles(".") : Promise.resolve(args);
    const logger = new Logger();
    fileGetter
        .then((files) => {
            return compile(files);
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
