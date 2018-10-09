"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
function add(a, b) {
    return a + b;
}
exports.add = add;
function minus(a, b) {
    return Promise.resolve(a - b);
}
exports.minus = minus;
function multiply(a, b, callback) {
    callback(null, a * b);
}
exports.multiply = multiply;
exports.syncFunction = add;
exports.asyncFunction = (a, b) => Promise.resolve(a + b);
exports.functionWithCallback = (a, b, cb) => cb(null, a + b);
const fixturesPath = path.resolve(path.dirname(path.dirname(__dirname)), "tests", "fixtures");
const rootSquarePath = path.resolve(fixturesPath, "rootSquare.py");
const cmdPath = path.resolve(fixturesPath, "add.py");
exports.cmd = `python3 ${cmdPath}`;
exports.rootSquare = `python3 ${rootSquarePath}`;
exports.resolvingPromise = Promise.resolve(73);
exports.rejectingPromise = Promise.reject("rejected");
//# sourceMappingURL=lib.js.map