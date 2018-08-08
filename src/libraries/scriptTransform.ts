import * as ts from "typescript";

export function tsToJs(source: string) {
    const compilerOptions = {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES5,
    };
    const reportDiagnostics = true;
    const result = ts.transpileModule(source, { compilerOptions, reportDiagnostics });
    return result.outputText;
}
