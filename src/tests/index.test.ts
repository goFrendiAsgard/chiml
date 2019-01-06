import { R, X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";
import { Player } from "./fixtures/Player";

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

    it("invoker works", () => {
        const initPlayer = R.construct(Player as any);
        const setWeapon = X.invoker(1, "setWeapon", "Frostmourne");
        const setDamage = X.invoker(1, "setDamage");
        const attack = X.invoker(0, "attack");
        const main: (name: string) => string = R.pipe(
            initPlayer,
            setWeapon,
            R.last,
            setDamage(50),
            R.last,
            attack(),
            R.head,
        );
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

    it("fluent works", () => {
        const initPlayer = R.construct(Player as any);
        const setDamageAndDoAttack = X.fluent([
            [1, "setWeapon", "Frostmourne"],
            [1, "setDamage"],
            [0, "attack"],
        ]);
        const main: (name: string) => string = R.pipe(
            initPlayer,
            setDamageAndDoAttack(50),
        );
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

    it("fluent works with no default parameters", () => {
        const initPlayer = R.construct(Player as any);
        const setDamageAndDoAttack = X.fluent([
            [1, "setWeapon"],
            [1, "setDamage"],
            [0, "attack"],
        ]);
        const main: (name: string) => string = R.pipe(
            initPlayer,
            setDamageAndDoAttack("Frostmourne", 50),
        );
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

    it("initAndFluent works", () => {
        const initPlayer = R.construct(Player as any);
        const main = X.initAndFluent([
            [1, initPlayer],
            [1, "setWeapon"],
            [1, "setDamage"],
            [0, "attack"],
        ]);
        const result = main("Arthas", "Frostmourne", 50);
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

});

describe("imperative style", () => {

    it("works", async () => {
        // composition
        const asyncRootSquare = X.wrapCommand(commandRootSquare);
        const asyncMultiply = X.wrapNodeback(nodebackMultiply);
        const asyncAddAndMinus = X.concurrent(syncAdd, asyncMinus);
        const spreadListAndMultiply = R.apply(asyncMultiply);
        const main: (a: number, b: number) => Promise<number> = R.pipeP(
            asyncAddAndMinus,
            spreadListAndMultiply,
            asyncRootSquare,
        );
        // action
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

});
