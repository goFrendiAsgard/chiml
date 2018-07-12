#! /usr/bin/env node
import { RequireCache } from "@speedy/require-cache";
new RequireCache({cacheKiller: __dirname + "../package.json"}).start();

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
