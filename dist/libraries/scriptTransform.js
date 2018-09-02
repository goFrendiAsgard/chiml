"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("cache-require-paths");
const typescript_1 = require("typescript");
function tsToJs(source) {
    const compilerOptions = {
        module: typescript_1.ModuleKind.CommonJS,
        target: typescript_1.ScriptTarget.ES5,
    };
    const reportDiagnostics = true;
    const result = typescript_1.transpileModule(source, { compilerOptions, reportDiagnostics });
    return result.outputText;
}
exports.tsToJs = tsToJs;
//# sourceMappingURL=scriptTransform.js.map