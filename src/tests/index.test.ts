import { X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";

describe("foldInput", () => {

    it("works", () => {
        const fn = (...args) => X.sum(args);
        const foldedFn = X.foldInput(fn);
        const result = foldedFn([1, 2, 3]);
        expect(result).toBe(6);
    });

});

describe("spreadInput", () => {

    it("works", () => {
        const fn = (args) => X.sum(args);
        const spreadedFn = X.spreadInput(fn);
        const result = spreadedFn(1, 2, 3);
        expect(result).toBe(6);
    });

});

describe("wrapSync", () => {

    it("works", async () => {
        const fn = (args) => X.sum(args);
        const wrapped = X.wrapSync(fn);
        const result = await wrapped([1, 2, 3]);
        expect(result).toBe(6);
        return null;
    });

});

describe("wrapNodeback", () => {

    it("works", async () => {
        const fn = (a, b, cb) => cb(null, a + b);
        const wrapped = X.wrapNodeback(fn);
        const result = await wrapped(4, 5);
        expect(result).toBe(9);
        return null;
    });

    it("works on multiple-return", async () => {
        const fn = (a, b, cb) => cb(null, a + b, a - b);
        const wrapped = X.wrapNodeback(fn);
        const result = await wrapped(4, 5);
        expect(result).toMatchObject([9, -1]);
        return null;
    });

    it("throw error on callback-error", async () => {
        const fn = (cb) => cb("error");
        const wrapped = X.wrapNodeback(fn);
        try {
            const result = await wrapped();
            expect(true).toBeFalsy();
        } catch (error) {
            expect(error).toBe("error");
        }
        return null;
    });

});

describe("wrapCommand", () => {

    it("works", async () => {
        const wrapped = X.wrapCommand(commandRootSquare);
        const result = await wrapped(4);
        expect(result).toBe(2);
        return null;
    });

    it("works on non-json-parsable return", async () => {
        const wrapped = X.wrapCommand("echo");
        const result = await wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works on single-word command", async () => {
        const wrapped = X.wrapCommand("echo");
        const result = await wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works on command with ${PWD}", async () => {
        const wrapped = X.wrapCommand("echo ${PWD}");
        const result = await wrapped("Hello world");
        expect(result).toContain("Hello world");
        return null;
    });

    it("works on command with templated-parameter", async () => {
        const wrapped = X.wrapCommand("echo ${2} ${1}");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works on command with escaped templated-parameter", async () => {
        const wrapped = X.wrapCommand("echo ${2} \\${1}");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello ${1}");
        return null;
    });

    it("works on command with templated-parameter without curly brace", async () => {
        const wrapped = X.wrapCommand("echo $2 $1");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works on command with escaped templated-parameter without curly brace", async () => {
        const wrapped = X.wrapCommand("echo $2 \\$1");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello $1");
        return null;
    });

    it("throw error on command-error", async () => {
        const wrapped = X.wrapCommand("mantan not found");
        try {
            const result = await wrapped();
            expect(true).toBeFalsy();
        } catch (error) {
            expect(error).toBeDefined();
        }
        return null;
    });

});

describe("imperative style", () => {

    it ("works", async () => {
        // composition
        const asyncRootSquare = X.wrapCommand(commandRootSquare);
        const asyncMultiply = X.wrapNodeback(nodebackMultiply);
        const asyncAdd = X.wrapSync(syncAdd);
        const asyncAddAndMinus = X.concurrent(asyncAdd, asyncMinus);
        const convergedAsyncMultiply = X.foldInput(asyncMultiply);
        const main: (a: number, b: number) => Promise<number> = X.pipeP(
            asyncAddAndMinus,
            convergedAsyncMultiply,
            asyncRootSquare,
        );
        // action
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

});
