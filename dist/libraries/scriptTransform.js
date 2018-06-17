"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
