import {SingleTask} from "../classes/SingleTask";
import {chimlToConfig, parseStringArray} from "../libraries/stringUtil";

export function compile(chiml): Promise<any> {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Expected chiml script/file as parameter");
  } else {
    compile(args[0]).then((result) => {
      console.log(result);
    }).catch((error) => {
      console.error(error);
    });
  }
}
