import * as path from "path";

export function add(a: number, b: number): number {
    return a + b;
}

export function minus(a: number, b: number): Promise<number> {
    return Promise.resolve(a - b);
}

export function multiply(a: number, b: number, callback: (error: Error, result: number) => void) {
    callback(null, a * b);
}

export function square(x: number): number {
    return x * x;
}

export const syncFunction = add;
export function errorSyncFunction(a: number, b: number) {
    throw(new Error("sync function error"));
}
export function asyncFunction(a: number, b: number) {
    return Promise.resolve(a + b);
}
export function errorAsyncFunction(a: number, b: number) {
    return Promise.reject("async function rejected");
}
export function functionWithCallback(a: number, b: number, cb: (error, result) => void) {
    cb(null, a + b);
}
export function functionWithCallbackYieldError(a: number, b: number, cb: (error) => void) {
    cb("callback error");
}
export function functionWithCallbackAndMultipleReturn(a: number, b: number, cb: (error, ...result: any[]) => void) {
    cb(null, a + b, a - b);
}

const fixturesPath = path.resolve(path.dirname(path.dirname(__dirname)), "tests", "fixtures");
const rootSquarePath = path.resolve(fixturesPath, "rootSquare.py");
const cmdPath = path.resolve(fixturesPath, "add.py");
export const cmd = `python3 ${cmdPath}`;
export const rootSquare = `python3 ${rootSquarePath}`;

export const resolvingPromise = Promise.resolve(73);
export const rejectingPromise = Promise.reject("rejected");
