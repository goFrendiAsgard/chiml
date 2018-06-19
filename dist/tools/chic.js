"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function compile(chiml) {
    return new Promise((resolve, reject) => {
        resolve(true);
    });
}
exports.compile = compile;
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Expected chiml script/file as parameter");
    }
    else {
        compile(args[0]).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.error(error);
        });
    }
}
//# sourceMappingURL=chic.js.map