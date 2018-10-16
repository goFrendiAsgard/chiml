"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function normalizedProgram(program) {
    // pass
}
function isSingle(program) {
    return "do" in program && typeof program.do === "string";
}
function isParallel(program) {
    return "parallel" in program && Array.isArray(program.parallel);
}
function isSeries(program) {
    return "do" in program && Array.isArray(program.do);
}
function isBranched(program) {
    return "if" in program && typeof program.if === "string";
}
function isMap(program) {
    return "map" in program && program.map === "string";
}
function isFilter(program) {
    return "filter" in program && program.filter === "string";
}
function isReduce(program) {
    return "reduce" in program && program.reduce === "string" &&
        "accumulator" in program && program.accumulator === "string";
}
//# sourceMappingURL=structure.js.map