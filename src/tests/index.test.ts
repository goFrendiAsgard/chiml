import { R, X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";
import { Player } from "./fixtures/Player";

describe("foldInput", () => {

    it("works", () => {
        const fn = (...args) => R.sum(args);
        const foldedFn = X.foldInput(fn);
        const result = foldedFn([1, 2, 3]);
        expect(result).toBe(6);
    });

});

describe("spreadInput", () => {

    it("works", () => {
        const fn = (args) => R.sum(args);
        const spreadedFn = X.spreadInput(fn);
        const result = spreadedFn(1, 2, 3);
        expect(result).toBe(6);
    });

});

describe("wrapSync", () => {

    it("works", async () => {
        const fn = (args) => R.sum(args);
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

    it("works with multiple-return", async () => {
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

    it("works with non-json-parsable return", async () => {
        const wrapped = X.wrapCommand("echo");
        const result = await wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works with single-word command", async () => {
        const wrapped = X.wrapCommand("echo");
        const result = await wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works with command with ${PWD}", async () => {
        const wrapped = X.wrapCommand("echo ${PWD}");
        const result = await wrapped("Hello world");
        expect(result).toContain("Hello world");
        expect(result).toContain("chiml");
        return null;
    });

    it("works with command that has templated-parameter", async () => {
        const wrapped = X.wrapCommand("echo ${2} ${1}");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works with command that has escaped templated-parameter", async () => {
        const wrapped = X.wrapCommand("echo ${2} \\${1}");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello ${1}");
        return null;
    });

    it("works with command that has templated-parameter, even if ins count is less than expected", async () => {
        const wrapped = X.wrapCommand("echo ${2} ${1}");
        const result = await wrapped("Hello");
        expect(result).toBe("Hello");
        return null;
    });

    it("works with command that has templated-parameter, even if parameter index used more than once", async () => {
        const wrapped = X.wrapCommand("echo ${2} ${2} ${1}");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello Hello world");
        return null;
    });

    it("works with command that has templated-parameter without curly brace", async () => {
        const wrapped = X.wrapCommand("echo $2 $1");
        const result = await wrapped("world", "Hello");
        expect(result).toBe("Hello world");
        return null;
    });

    it("works with command that has escaped templated-parameter without curly brace", async () => {
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

describe("class helpers", () => {

    it("works", () => {
        const initPlayer = X.createClassInitiator(Player);
        const setWeaponToFrostmourne = X.createMethodExecutor("setWeapon", "Frostmourne");
        const setDamageTo50 = X.createMethodExecutor("setDamage", 50);
        const attack = X.createMethodEvaluator("attack");
        const main: (name: string) => string = R.pipe(initPlayer, setWeaponToFrostmourne, setDamageTo50, attack);
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

});

describe("imperative style", () => {

    it("works", async () => {
        // composition
        const asyncRootSquare = X.wrapCommand(commandRootSquare);
        const asyncMultiply = X.wrapNodeback(nodebackMultiply);
        const asyncAdd = X.wrapSync(syncAdd);
        const asyncAddAndMinus = X.concurrent(asyncAdd, asyncMinus);
        const convergedAsyncMultiply = X.foldInput(asyncMultiply);
        const main: (a: number, b: number) => Promise<number> = R.pipeP(
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
