"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "../package.json" }).start();
const path_1 = require("path");
const utilities = require("../libraries/utilities");
function createSandbox(chimlPath) {
    const validChimlPath = String(chimlPath).match(/^(.*)\.chiml/gmi);
    const fileName = validChimlPath ? path_1.resolve(chimlPath) : path_1.resolve(process.cwd(), "virtual");
    const dirName = path_1.dirname(fileName);
    const sandbox = Object.assign({
        __dirname: dirName,
        __filename: fileName,
        __isCompiled: false,
        clearImmediate,
        clearInterval,
        clearTimeout,
        console,
        require,
        setImmediate,
        setInterval,
        setTimeout,
    }, utilities);
    return sandbox;
}
exports.createSandbox = createSandbox;
//# sourceMappingURL=sandbox.js.map