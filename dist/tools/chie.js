"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SingleTask_1 = require("../classes/SingleTask");
const stringUtil_1 = require("../libraries/stringUtil");
function execute(...args) {
    const chiml = args[0];
    const ins = stringUtil_1.parseStringArray(args.slice(1));
    return new Promise((resolve, reject) => {
        stringUtil_1.chimlToConfig(chiml).then((config) => {
            const task = new SingleTask_1.SingleTask(config);
            task.execute(ins).then(resolve).catch(reject);
        });
    });
}
exports.execute = execute;
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Expected chiml script/file as parameter");
    }
    else {
        execute(...args).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.error(error);
        });
    }
}
//# sourceMappingURL=chie.js.map