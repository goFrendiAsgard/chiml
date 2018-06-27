#! /usr/bin/env node
import * as cacheRequirePaths from "cache-require-paths";
import {execute} from "../libraries/tools";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Expect more than one parameter(s): `chiml script/file` and `inputs`");
  } else {
    execute(...args).then((result) => {
      console.log(result);
    }).catch((error) => {
      console.error(error);
    });
  }
}
