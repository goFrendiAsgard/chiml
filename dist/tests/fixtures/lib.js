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
function square(x) {
    return x * x;
}
exports.square = square;
exports.syncFunction = add;
function errorSyncFunction(a, b) {
    throw (new Error("sync function error"));
}
exports.errorSyncFunction = errorSyncFunction;
function asyncFunction(a, b) {
    return Promise.resolve(a + b);
}
exports.asyncFunction = asyncFunction;
function errorAsyncFunction(a, b) {
    return Promise.reject("async function rejected");
}
exports.errorAsyncFunction = errorAsyncFunction;
function functionWithCallback(a, b, cb) {
    cb(null, a + b);
}
exports.functionWithCallback = functionWithCallback;
function functionWithCallbackYieldError(a, b, cb) {
    cb("callback error");
}
exports.functionWithCallbackYieldError = functionWithCallbackYieldError;
function functionWithCallbackAndMultipleReturn(a, b, cb) {
    cb(null, a + b, a - b);
}
exports.functionWithCallbackAndMultipleReturn = functionWithCallbackAndMultipleReturn;
const fixturesPath = path.resolve(path.dirname(path.dirname(__dirname)), "tests", "fixtures");
const rootSquarePath = path.resolve(fixturesPath, "rootSquare.py");
const cmdPath = path.resolve(fixturesPath, "add.py");
const helloPath = path.resolve(fixturesPath, "hello.py");
const greetingPath = path.resolve(fixturesPath, "greeting.py");
exports.cmd = `python3 ${cmdPath}`;
exports.rootSquare = `python3 ${rootSquarePath}`;
exports.hello = `python3 ${helloPath}`;
exports.greeting = `python3 ${greetingPath}`;
exports.greetingWithParams = `python3 ${greetingPath} --greeting $\{1} --name $\{2}`;
exports.resolvingPromise = Promise.resolve(73);
exports.rejectingPromise = Promise.reject("rejected");
//# sourceMappingURL=lib.js.map