import {SingleTask} from "../classes/SingleTask";
import {chimlToConfig, parseStringArray} from "../libraries/stringUtil";

export function execute(...args: any[]): Promise<any> {
  const chiml = args[0];
  const ins = parseStringArray(args.slice(1));
  return new Promise((resolve, reject) => {
    chimlToConfig(chiml).then((config) => {
      const task = new SingleTask(config);
      task.execute(ins).then(resolve).catch(reject);
    });
  });
}

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
