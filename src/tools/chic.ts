#! /usr/bin/env node
import {compileChimlFile} from "../libraries/tools";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("Expect single parameter: `chiml file`");
  } else {
    const chiml = args[0];
    compileChimlFile(chiml).then((jsFilePath) => {
      console.log(`JavaScript file created: ${jsFilePath}`);
    }).catch((error) => {
      console.error(error);
    });
  }
}
