#! /usr/bin/env node
import {compile} from "../libraries/tools";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Expect single parameter: `chiml file`");
  } else {
    compile(args).then((jsFilePaths) => {
      const createdFileList = jsFilePaths.map((filePath) => {
        return "- " + filePath;
      }).join("\n");
      console.log(`JavaScript file created:\n${createdFileList}`);
    }).catch((error) => {
      console.error(error);
    });
  }
}
