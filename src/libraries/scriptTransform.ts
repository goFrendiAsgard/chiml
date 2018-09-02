require("cache-require-paths");
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";

export function tsToJs(source: string) {
    const compilerOptions = {
        module: ModuleKind.CommonJS,
        target: ScriptTarget.ES5,
    };
    const reportDiagnostics = true;
    const result = transpileModule(source, { compilerOptions, reportDiagnostics });
    return result.outputText;
}
