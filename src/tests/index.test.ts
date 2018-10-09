import { chiml as $ } from "../index";
import {
    add, asyncFunction, cmd, errorAsyncFunction, errorSyncFunction,
    functionWithCallback, functionWithCallbackAndMultipleReturn,
    functionWithCallbackYieldError, minus, multiply, rejectingPromise,
    resolvingPromise, rootSquare, square, syncFunction } from "./fixtures/lib";

describe("works with promises", async () => {

    it ("single resolving promise works", async () => {
        try {
            const result = await $(resolvingPromise);
            expect(result).toBe(73);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
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
    });

    it ("single rejecting promise works", async () => {
        try {
            const result = await $(rejectingPromise);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("rejected");
        }
    });

    it ("multiple promise works", async () => {
        try {
            const result = await $(rejectingPromise, resolvingPromise);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("rejected");
        }
    });

});

describe("works with async functions", async () => {

    it ("async function works", async () => {
        try {
            const result = await $(asyncFunction, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    });

});

describe("works with sync functions", async () => {

    it ("sync function works", async () => {
        try {
            const result = await $(syncFunction, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    });

});

describe("works with functions that have node callback", async () => {

    it ("function with callback works", async () => {
        try {
            const result = await $(functionWithCallback, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    });

});

describe("works with cmd", async () => {

    it ("cmd works", async () => {
        try {
            const result = await $(cmd, 4, 5);
            expect(result).toBe(9);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    });

});

describe("works with composition", async () => {

    it ("composition works", async () => {
        try {
            const result = await $([square, minus], 9, 4);
            expect(result).toBe(25);
        } catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    });

});

describe("work", async () => {

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
    });

});
