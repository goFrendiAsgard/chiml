"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "../package.json" }).start();
const ts = require("typescript");
function tsToJs(source) {
    const compilerOptions = {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES5,
    };
    const reportDiagnostics = true;
    const result = ts.transpileModule(source, { compilerOptions, reportDiagnostics });
    return result.outputText;
}
exports.tsToJs = tsToJs;
//# sourceMappingURL=scriptTransform.js.map