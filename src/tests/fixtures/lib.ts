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

export const syncFunction = add;
export const asyncFunction = (a: number, b: number) => Promise.resolve(a + b);
export const functionWithCallback = (a: number, b: number, cb: (error, result) => void) => cb(null, a + b);

const fixturesPath = path.resolve(
    path.dirname(path.dirname(__dirname)),
    "dist", "tests", "fixtures");
const rootSquarePath = path.resolve(fixturesPath, "rootSquare.py");
const cmdPath = path.resolve(fixturesPath, "add.py");
export const cmd = `python3 ${cmdPath}`;
export const rootSquare = `python3 ${rootSquarePath}`;

export const resolvingPromise = Promise.resolve(73);
export const rejectingPromise = Promise.reject("rejected");
