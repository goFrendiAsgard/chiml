import * as path from "path";
const fixturesPath = path.resolve(path.dirname(path.dirname(__dirname)), "tests", "fixtures");
const rootSquarePath = path.resolve(fixturesPath, "rootSquare.py");

export function syncAdd(a: number, b: number): number {
    return a + b;
}
export function asyncMinus(a: number, b: number): Promise<number> {
    return Promise.resolve(a - b);
}
export function nodebackMultiply(a: number, b: number, callback: (error: Error, result: number) => void) {
    callback(null, a * b);
}

export const commandRootSquare = `python3 ${rootSquarePath}`;
