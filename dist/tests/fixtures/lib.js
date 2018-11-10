"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fixturesPath = path.resolve(path.dirname(path.dirname(__dirname)), "tests", "fixtures");
const rootSquarePath = path.resolve(fixturesPath, "rootSquare.py");
function syncAdd(a, b) {
    return a + b;
}
exports.syncAdd = syncAdd;
function asyncMinus(a, b) {
    return Promise.resolve(a - b);
}
exports.asyncMinus = asyncMinus;
function nodebackMultiply(a, b, callback) {
    callback(null, a * b);
}
exports.nodebackMultiply = nodebackMultiply;
exports.commandRootSquare = `python3 ${rootSquarePath}`;
