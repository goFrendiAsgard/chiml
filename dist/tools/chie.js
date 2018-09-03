#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cache-require-paths");
const Logger_1 = require("../classes/Logger");
const tools_1 = require("../libraries/tools");
function main(args) {
    const logger = new Logger_1.Logger();
    if (args.length < 1) {
        return logger.error("Expect more than one parameter(s): `chiml script/file` and `inputs`");
    }
    return tools_1.execute(...args)
        .then((result) => {
        const shownResult = Array.isArray(result) || typeof result === "object" ?
            JSON.stringify(result, null, 2) : result;
        logger.log(shownResult);
    })
        .catch((error) => {
        logger.error(error);
    });
}
if (require.main === module) {
    const args = process.argv.slice(2);
    main(args);
}
//# sourceMappingURL=chie.js.map