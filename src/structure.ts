import { IProgram } from "./interfaces";

function normalizedProgram(program: IProgram) {
    // pass
}

function isSingle(program: IProgram) {
    return "do" in program && typeof program.do === "string";
}

function isParallel(program: IProgram) {
    return "parallel" in program && Array.isArray(program.parallel);
}

function isSeries(program: IProgram) {
    return "do" in program && Array.isArray(program.do);
}

function isBranched(program: IProgram) {
    return "if" in program && typeof program.if === "string";
}

function isMap(program: IProgram) {
    return "map" in program && program.map === "string";
}

function isFilter(program: IProgram) {
    return "filter" in program && program.filter === "string";
}

function isReduce(program: IProgram) {
    return "reduce" in program && program.reduce === "string" &&
        "accumulator" in program && program.accumulator === "string";
}
