"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const utilities = require("../libraries/utilities");
function createSandbox(chimlPath) {
    const validChimlPath = String(chimlPath).match(/^(.*)\.chiml/gmi);
    const fileName = validChimlPath ? path_1.resolve(chimlPath) : path_1.resolve(process.cwd(), "virtual");
    const dirName = path_1.dirname(fileName);
    const sandbox = Object.assign({
        __dirname: dirName,
        __fileName: fileName,
        __isCompiled: false,
        console,
        require,
    }, utilities);
    return sandbox;
}
exports.createSandbox = createSandbox;
//# sourceMappingURL=sandbox.js.map