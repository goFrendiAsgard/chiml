import { chiml as $, filter, map, reduce } from "../index";
import {
    add, asyncFunction, cmd, errorAsyncFunction, errorSyncFunction,
    functionWithCallback, functionWithCallbackAndMultipleReturn,
    functionWithCallbackYieldError, hello, minus, multiply, rejectingPromise,
    resolvingPromise, rootSquare, square, syncFunction } from "./fixtures/lib";

describe("works with promises", () => {

    it ("single resolving promise works", async () => {
        try {
            const result = await $(resolvingPromise);
            expect(result).toBe(73);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it ("multiple promise works", async () => {
        try {
            const result = await $(resolvingPromise, resolvingPromise);
            expect(result[0]).toBe(73);
            expect(result[1]).toBe(73);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it ("single rejecting promise works", async () => {
        try {
            const result = await $(rejectingPromise);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("rejected");
        }
        return null;
    });

    it ("multiple promise works", async () => {
        try {
            const result = await $(rejectingPromise, resolvingPromise);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("rejected");
        }
        return null;
    });

});

describe("works with async functions", () => {

    it ("async function works", async () => {
        try {
            const result = await $(asyncFunction, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it("async function that yield error works", async () => {
        try {
            const result = await $(errorAsyncFunction, 4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("async function rejected");
        }
        return null;
    });

});

describe("works with sync functions", () => {

    it ("sync function works", async () => {
        try {
            const result = await $(syncFunction, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it("sync function that yield error works", async () => {
        try {
            const result = await $(errorSyncFunction, 4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error.message).toBe("sync function error");
        }
        return null;
    });

});

describe("works with functions that have node callback", () => {

    it ("function with callback works", async () => {
        try {
            const result = await $(functionWithCallback, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it ("function with callback and multiple results works", async () => {
        try {
            const result = await $(functionWithCallbackAndMultipleReturn, 4, 5);
            expect(result[0]).toBe(9);
            expect(result[1]).toBe(-1);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it("function with callback that yield error works", async () => {
        try {
            const result = await $(functionWithCallbackYieldError, 4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("callback error");
        }
        return null;
    });

});

describe("works with cmd", () => {

    it ("cmd works", async () => {
        try {
            const result = await $(cmd, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it ("cmd that return a non-json-parseable string works", async () => {
        try {
            const result = await $(hello, "world");
            expect(result).toBe("Hello world");
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it ("cmd that contains single command works", async () => {
        try {
            const result = await $("ls");
            expect(result).toBeDefined();
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it("error cmd works", async () => {
        try {
            const result = await $("/dev/null/oraono", 4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBeDefined();
        }
        return null;
    });

});

describe("works with composition", () => {

    it ("composition works", async () => {
        try {
            const result = await $([square, minus], 9, 4);
            expect(result).toBe(25);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

});

describe("work", () => {

    it("simple case works", async () => {
        try {
            const n1 = 10;
            const n2 = 8;
            const [addResult, minusResult] = await $(
                $(add, n1, n2),
                $(minus, n1, n2),
            );
            expect(addResult).toBe(18);
            expect(minusResult).toBe(2);
            const result = await $([rootSquare, multiply], addResult, minusResult);
            expect(result).toBe(6);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

    it("simple case with parallel and composition works", async () => {
        try {
            const n1 = 10;
            const n2 = 8;
            const result = await $(
                $(add, n1, n2),
                $(minus, n1, n2),
            ).then(async (r) => {
                return await $([rootSquare, multiply], r[0], r[1]);
            });
            expect(result).toBe(6);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
        return null;
    });

});

describe("map", () => {

    it("work with sync function", async () => {
        const data: number[] = [1, 2, 3, 4, 5];
        const result = await $(map((x: number) => x * x), data);
        expect(result).toMatchObject([1, 4, 9, 16, 25]);
        return null;
    });

});

describe("filter", () => {

    it("work with sync function", async () => {
        const data: number[] = [1, 2, 3, 4, 5];
        const result = await $(filter((x: number) => x % 2 === 0 ), data);
        expect(result).toMatchObject([2, 4]);
        return null;
    });

});

describe("reduce", () => {

    it("work with sync function", async () => {
        const data: number[] = [1, 2, 3, 4, 5];
        const result = await $(reduce((x: number, y: number) => x + y ), data, 0);
        expect(result).toBe(15);
        return null;
    });

});
