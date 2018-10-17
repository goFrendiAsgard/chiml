"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalizedProgram(program) {
    // pass
}
function isSingleStatement(program) {
    return "do" in program;
}
function isParallelStatement(program) {
    return "parallel" in program && Array.isArray(program.parallel);
}
function isSerialStatement(program) {
    return "do" in program && Array.isArray(program.do);
}
function isBranchedStatement(program) {
    return "if" in program;
}
function isMapStatement(program) {
    return "map" in program;
}
function isFilterStatement(program) {
    return "filter" in program;
}
function isReduceStatement(program) {
    return "reduce" in program && "accumulator" in program && program.accumulator === "string";
}
//# sourceMappingURL=structure.js.map