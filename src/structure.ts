import { IProgram } from "./interfaces";

function normalizedProgram(program: IProgram) {
    // pass
}

function isSingleStatement(program: IProgram) {
    return "do" in program;
}

function isParallelStatement(program: IProgram) {
    return "parallel" in program && Array.isArray(program.parallel);
}

function isSerialStatement(program: IProgram) {
    return "do" in program && Array.isArray(program.do);
}

function isBranchedStatement(program: IProgram) {
    return "if" in program;
}

function isMapStatement(program: IProgram) {
    return "map" in program;
}

function isFilterStatement(program: IProgram) {
    return "filter" in program;
}

function isReduceStatement(program: IProgram) {
    return "reduce" in program && "accumulator" in program && program.accumulator === "string";
}
