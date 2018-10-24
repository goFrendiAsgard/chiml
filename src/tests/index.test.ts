import * as X from "../index";
import { IReduceFunction } from "../interfaces";
import {
    add, asyncFunction, cmd, errorAsyncFunction, errorSyncFunction,
    functionWithCallback, functionWithCallbackAndMultipleReturn,
    functionWithCallbackYieldError, greeting, greetingWithParams,
    hello, minus, multipleMinusWithCallback, multiply, plusAndMinusWithCallback, rejectingPromise,
    resolvingPromise, rootSquare, square, syncFunction } from "./fixtures/lib";

describe("wrap non promise and non function", () => {

    it ("single number works", async () => {
        const result = await X.wrap(8)();
        expect(result).toBe(8);
        return null;
    });

});

describe("wrap promise", () => {

    it ("single resolving promise works", async () => {
        const result = await X.wrap(resolvingPromise)();
        expect(result).toBe(73);
        return null;
    });

    it ("single rejecting promise works", async () => {
        try {
            const result = await X.wrap(rejectingPromise)();
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("rejected");
        }
        return null;
    });

});

describe("wrap async functions", () => {

    it ("async function works", async () => {
        const result = await X.wrap(asyncFunction)(4, 5);
        expect(result).toBe(9);
        return null;
    });

    it("async function that yield error works", async () => {
        try {
            const result = await X.wrap(errorAsyncFunction)(4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("async function rejected");
        }
        return null;
    });

});

describe("wrap sync functions", () => {

    it ("sync function works", async () => {
        const result = await X.wrap(syncFunction)(4, 5);
        expect(result).toBe(9);
        return null;
    });

    it("sync function that yield error works", async () => {
        try {
            const result = await X.wrap(errorSyncFunction)(4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error.message).toBe("sync function error");
        }
        return null;
    });

});

describe("wrap functions that have node callback", () => {

    it ("function with callback works", async () => {
        const result = await X.wrap(functionWithCallback)(4, 5);
        expect(result).toBe(9);
        return null;
    });

    it ("function with callback works", async () => {
        const fn = X.curry(functionWithCallback, 2)(4);
        const result = await fn(5);
        expect(result).toBe(9);
        return null;
    });

    it ("function with callback and multiple results works", async () => {
        const result = await X.wrap(functionWithCallbackAndMultipleReturn)(4, 5);
        expect(result[0]).toBe(9);
        expect(result[1]).toBe(-1);
        return null;
    });

    it("function with callback that yield error works", async () => {
        try {
            const result = await X.wrap(functionWithCallbackYieldError)(4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("callback error");
        }
        return null;
    });

});

describe("wrap cmd", () => {

    it ("cmd works", async () => {
        const result = await X.wrap(cmd)(4, 5);
        expect(result).toBe(9);
        return null;
    });

    it ("cmd that return a non-json-parseable string works", async () => {
        const result = await X.wrap(hello)("world");
        expect(result).toBe("Hello world");
        return null;
    });

    it ("cmd that has no params works", async () => {
        const result = await X.wrap(greeting)();
        expect(result).toBe("hello world");
        return null;
    });

    it ("cmd that has positional params works", async () => {
        const result = await X.wrap(greetingWithParams)("hi", "Frodo");
        expect(result).toBe("hi Frodo");
        return null;
    });

    it("error cmd works", async () => {
        try {
            const result = await X.wrap("/dev/null/oraono")(4, 5);
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBeDefined();
        }
        return null;
    });

});

describe("pipe", () => {

    it ("works", async () => {
        const result = await X.pipe(
            X.wrap(minus),
            X.wrap(square),
        )(9, 4);
        expect(result).toBe(25);
        return null;
    });

});

describe("compose", () => {

    it ("works", async () => {
        const result = await X.compose(
            X.wrap(square),
            X.wrap(minus),
        )(9, 4);
        expect(result).toBe(25);
        return null;
    });

});

describe("parallel", () => {

    it ("resolving promises works", async () => {
        const result = await X.parallel(
            resolvingPromise,
            resolvingPromise,
        )();
        expect(result).toMatchObject([73, 73]);
        return null;
    });

    it ("resolving and rejecting promise works", async () => {
        try {
            const result = await X.parallel(
                resolvingPromise,
                rejectingPromise,
            )();
            expect(result).toBeUndefined();
        } catch (error) {
            expect(error).toBe("rejected");
        }
        return null;
    });

    it ("work with non-promise parameter", async () => {
        const result = await X.parallel(add, minus)(5, 3);
        expect(result).toMatchObject([8, 2]);
        return null;
    });

    it ("work with non-promise parameter, curried", async () => {
        const result = await X.parallel([add, minus], 2)(5)(3);
        expect(result).toMatchObject([8, 2]);
        return null;
    });

    it ("work with non-promise and more than two parameter", async () => {
        const result = await X.parallel(add, minus, multiply)(5, 3);
        expect(result).toMatchObject([8, 2, 15]);
        return null;
    });

});

describe("currying", () => {

    it ("curry 1 param", async () => {
        const twelveMinus = X.curry(multipleMinusWithCallback, 3)(12);
        const result = await twelveMinus(5, 5);
        expect(result).toBe(2);
        return null;
    });

    it ("curry 2 params", async () => {
        const nineMinus = X.curry(multipleMinusWithCallback, 3)(10, 1);
        const result = await nineMinus(4);
        expect(result).toBe(5);
        return null;
    });

    it ("curry 1 param and curry again", async () => {
        const twelveMinus = X.curry(multipleMinusWithCallback, 3)(12);
        const nineMinus = twelveMinus(3);
        const result = await nineMinus(5);
        expect(result).toBe(4);
        return null;
    });

});

describe("right currying", () => {

    it ("curry 1 param", async () => {
        const minusOne = X.curryRight(multipleMinusWithCallback, 3)(1);
        const result = await minusOne(3, 10);
        expect(result).toBe(6);
        return null;
    });

    it ("curry 2 params", async () => {
        const minusThree = X.curryRight(multipleMinusWithCallback, 3)(2, 1);
        const result = await minusThree(10);
        expect(result).toBe(7);
        return null;
    });

    it ("curry 1 param and curry again", async () => {
        const minusOne = X.curryRight(multipleMinusWithCallback, 3)(1);
        const minusThree = minusOne(2);
        const result = await minusThree(5);
        expect(result).toBe(2);
        return null;
    });

});

describe("curry with placeholder", () => {

    it ("curry placeholder, complete parameter count", async () => {
        const minusTwoAndPlusTen = X.curry(plusAndMinusWithCallback, 3)(10, X._, 2);
        const result = await minusTwoAndPlusTen(5);
        expect(result).toBe(13);
        return null;
    });

    it ("curry placeholder, incomplete parameter count", async () => {
        const minusTwo = X.curry(plusAndMinusWithCallback, 3)(X._, X._, 2);
        const plusTenMinusTwo = minusTwo(10);
        const result = await plusTenMinusTwo(5);
        expect(result).toBe(13);
        return null;
    });

});

describe("map", () => {

    it("work with sync function", async () => {
        const data: number[] = [1, 2, 3, 4, 5];
        const result = await X.map((x: number) => x * x)(data);
        expect(result).toMatchObject([1, 4, 9, 16, 25]);
        return null;
    });

});

describe("filter", () => {

    it("work with sync function", async () => {
        const data: number[] = [1, 2, 3, 4, 5];
        const result = await X.filter((x: number) => x % 2 === 0 )(data);
        expect(result).toMatchObject([2, 4]);
        return null;
    });

});

describe("reduce", () => {

    const reducedFunction: IReduceFunction = X.reduce((x: number, y: number) => x + y );

    it("work with sync function", async () => {
        const data: number[] = [1, 2, 3, 4, 5];
        const result = await reducedFunction(0, data);
        expect(result).toBe(15);
        return null;
    });

    it("work with sync function, curried", async () => {
        const data: number[] = [1, 2, 3, 4, 5];
        const result = await reducedFunction(0)(data);
        expect(result).toBe(15);
        return null;
    });

});

describe("work", () => {

    it("simple case works", async () => {
        const n1 = 10;
        const n2 = 8;
        const [addResult, minusResult] = await X.parallel(
            X.wrap(add)(n1, n2),
            X.wrap(minus)(n1, n2),
        )();
        expect(addResult).toBe(18);
        expect(minusResult).toBe(2);
        const result = await X.pipe(multiply, rootSquare)(addResult, minusResult);
        expect(result).toBe(6);
        return null;
    });

    it("simple case without side effect works", async () => {
        const n1 = 10;
        const n2 = 8;
        const result = await X.pipe(
            X.parallel(
                add,
                minus,
            ),
            X.curry(X.reduce(multiply), 2)(1),
            rootSquare,
        )(n1, n2);
        expect(result).toBe(6);
        return null;
    });

});
