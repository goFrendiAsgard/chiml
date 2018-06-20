#! /usr/bin/env node
import {execute} from "../libraries/tools";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Expected chiml script/file as parameter");
  } else {
    execute(...args).then((result) => {
      console.log(result);
    }).catch((error) => {
      console.error(error);
    });
  }
}
