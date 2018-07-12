#! /usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "../package.json" }).start();
const tools_1 = require("../libraries/tools");
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error("Expect more than one parameter(s): `chiml script/file` and `inputs`");
    }
    else {
        tools_1.execute(...args).then((result) => {
            console.log(result);
        }).catch((error) => {
            console.error(error);
        });
    }
}
//# sourceMappingURL=chie.js.map