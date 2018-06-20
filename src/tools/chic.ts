#! /usr/bin/env node
import {compile, getFiles} from "../libraries/tools";

if (require.main === module) {
  const args = process.argv.slice(2);
  const fileGetter = args.length < 1 ? getFiles(".") : Promise.resolve(args);
  fileGetter.then((files) => {
    return compile(files);
  }).then((jsFilePaths) => {
    const createdFileList = jsFilePaths.map((filePath) => {
      return "- " + filePath;
    }).join("\n");
    console.log(`JavaScript file created:\n${createdFileList}`);
  }).catch((error) => {
    console.error(error);
  });
}
