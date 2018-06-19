import {compileChimlFile} from "../libraries/tools";

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("Expected chiml file as parameter");
  } else {
    const chiml = args[0];
    compileChimlFile(chiml).then((result) => {
      console.log(result);
    }).catch((error) => {
      console.error(error);
    });
  }
}
