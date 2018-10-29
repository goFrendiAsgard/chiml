"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const X = require("../index");
const lib_1 = require("./fixtures/lib");
describe("wrap non promise and non function", () => {
    it("single number works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(8)();
        expect(result).toBe(8);
        return null;
    }));
});
describe("wrap promise", () => {
    it("single resolving promise works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.resolvingPromise)();
        expect(result).toBe(73);
        return null;
    }));
    it("single rejecting promise works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield X.wrap(lib_1.rejectingPromise)();
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("rejected");
        }
        return null;
    }));
});
describe("wrap async functions", () => {
    it("async function works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.asyncFunction)(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("async function that yield error works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield X.wrap(lib_1.errorAsyncFunction)(4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("async function rejected");
        }
        return null;
    }));
});
describe("wrap sync functions", () => {
    it("sync function works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.syncFunction)(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("sync function that yield error works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield X.wrap(lib_1.errorSyncFunction)(4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error.message).toBe("sync function error");
        }
        return null;
    }));
});
describe("wrap functions that have node callback", () => {
    it("function with callback works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.functionWithCallback)(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("function with callback works", () => __awaiter(this, void 0, void 0, function* () {
        const fn = X.curry(lib_1.functionWithCallback, 2)(4);
        const result = yield fn(5);
        expect(result).toBe(9);
        return null;
    }));
    it("function with callback and multiple results works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.functionWithCallbackAndMultipleReturn)(4, 5);
        expect(result[0]).toBe(9);
        expect(result[1]).toBe(-1);
        return null;
    }));
    it("function with callback that yield error works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield X.wrap(lib_1.functionWithCallbackYieldError)(4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("callback error");
        }
        return null;
    }));
});
describe("wrap cmd", () => {
    it("cmd works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.cmd)(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("cmd that return a non-json-parseable string works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.hello)("world");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("cmd that has no params works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.greeting)();
        expect(result).toBe("hello world");
        return null;
    }));
    it("cmd that has positional params works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.wrap(lib_1.greetingWithParams)("hi", "Frodo");
        expect(result).toBe("hi Frodo");
        return null;
    }));
    it("error cmd works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield X.wrap("/dev/null/oraono")(4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBeDefined();
        }
        return null;
    }));
});
describe("pipe", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.pipe(X.wrap(lib_1.minus), X.wrap(lib_1.square))(9, 4);
        expect(result).toBe(25);
        return null;
    }));
});
describe("compose", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.compose(X.wrap(lib_1.square), X.wrap(lib_1.minus))(9, 4);
        expect(result).toBe(25);
        return null;
    }));
});
describe("parallel", () => {
    it("resolving promises works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.parallel(lib_1.resolvingPromise, lib_1.resolvingPromise)();
        expect(result).toMatchObject([73, 73]);
        return null;
    }));
    it("resolving and rejecting promise works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield X.parallel(lib_1.resolvingPromise, lib_1.rejectingPromise)();
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("rejected");
        }
        return null;
    }));
    it("work with non-promise parameter", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.parallel(lib_1.add, lib_1.minus)(5, 3);
        expect(result).toMatchObject([8, 2]);
        return null;
    }));
    it("work with non-promise parameter, curried", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.parallel([lib_1.add, lib_1.minus], 2)(5)(3);
        expect(result).toMatchObject([8, 2]);
        return null;
    }));
    it("work with non-promise and more than two parameter", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.parallel(lib_1.add, lib_1.minus, lib_1.multiply)(5, 3);
        expect(result).toMatchObject([8, 2, 15]);
        return null;
    }));
});
describe("currying", () => {
    it("curry 1 param", () => __awaiter(this, void 0, void 0, function* () {
        const twelveMinus = X.curry(lib_1.multipleMinusWithCallback, 3)(12);
        const result = yield twelveMinus(5, 5);
        expect(result).toBe(2);
        return null;
    }));
    it("curry 2 params", () => __awaiter(this, void 0, void 0, function* () {
        const nineMinus = X.curry(lib_1.multipleMinusWithCallback, 3)(10, 1);
        const result = yield nineMinus(4);
        expect(result).toBe(5);
        return null;
    }));
    it("curry 1 param and curry again", () => __awaiter(this, void 0, void 0, function* () {
        const twelveMinus = X.curry(lib_1.multipleMinusWithCallback, 3)(12);
        const nineMinus = twelveMinus(3);
        const result = yield nineMinus(5);
        expect(result).toBe(4);
        return null;
    }));
});
describe("right currying", () => {
    it("curry 1 param", () => __awaiter(this, void 0, void 0, function* () {
        const minusOne = X.curryRight(lib_1.multipleMinusWithCallback, 3)(1);
        const result = yield minusOne(3, 10);
        expect(result).toBe(6);
        return null;
    }));
    it("curry 2 params", () => __awaiter(this, void 0, void 0, function* () {
        const minusThree = X.curryRight(lib_1.multipleMinusWithCallback, 3)(2, 1);
        const result = yield minusThree(10);
        expect(result).toBe(7);
        return null;
    }));
    it("curry 1 param and curry again", () => __awaiter(this, void 0, void 0, function* () {
        const minusOne = X.curryRight(lib_1.multipleMinusWithCallback, 3)(1);
        const minusThree = minusOne(2);
        const result = yield minusThree(5);
        expect(result).toBe(2);
        return null;
    }));
});
describe("curry with placeholder", () => {
    it("curry placeholder, complete parameter count", () => __awaiter(this, void 0, void 0, function* () {
        const minusTwoAndPlusTen = X.curry(lib_1.plusAndMinusWithCallback, 3)(10, X._, 2);
        const result = yield minusTwoAndPlusTen(5);
        expect(result).toBe(13);
        return null;
    }));
    it("curry placeholder, incomplete parameter count", () => __awaiter(this, void 0, void 0, function* () {
        const minusTwo = X.curry(lib_1.plusAndMinusWithCallback, 3)(X._, X._, 2);
        const plusTenMinusTwo = minusTwo(10);
        const result = yield plusTenMinusTwo(5);
        expect(result).toBe(13);
        return null;
    }));
});
describe("map", () => {
    it("work with sync function", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield X.map((x) => x * x)(data);
        expect(result).toMatchObject([1, 4, 9, 16, 25]);
        return null;
    }));
});
describe("filter", () => {
    it("work with sync function", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield X.filter((x) => x % 2 === 0)(data);
        expect(result).toMatchObject([2, 4]);
        return null;
    }));
});
describe("reduce", () => {
    const reducedFunction = X.reduce((x, y) => x + y);
    it("work with sync function", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield reducedFunction(0, data);
        expect(result).toBe(15);
        return null;
    }));
    it("work with sync function, curried", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield reducedFunction(0)(data);
        expect(result).toBe(15);
        return null;
    }));
});
describe("work", () => {
    it("simple case works", () => __awaiter(this, void 0, void 0, function* () {
        const n1 = 10;
        const n2 = 8;
        const [addResult, minusResult] = yield X.parallel(X.wrap(lib_1.add)(n1, n2), X.wrap(lib_1.minus)(n1, n2))();
        expect(addResult).toBe(18);
        expect(minusResult).toBe(2);
        const result = yield X.pipe(lib_1.multiply, lib_1.rootSquare)(addResult, minusResult);
        expect(result).toBe(6);
        return null;
    }));
    it("simple case without side effect works", () => __awaiter(this, void 0, void 0, function* () {
        const n1 = 10;
        const n2 = 8;
        const result = yield X.pipe(X.parallel(lib_1.add, lib_1.minus), X.curry(X.reduce(lib_1.multiply), 2)(1), lib_1.rootSquare)(n1, n2);
        expect(result).toBe(6);
        return null;
    }));
});
describe("arithmetic", () => {
    it("add works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.add(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("add works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.add(4)(5);
        expect(result).toBe(9);
        return null;
    }));
    it("subtract works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.subtract(4, 5);
        expect(result).toBe(-1);
        return null;
    }));
    it("subtract works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.subtract(4)(5);
        expect(result).toBe(-1);
        return null;
    }));
    it("multiply works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.multiply(4, 5);
        expect(result).toBe(20);
        return null;
    }));
    it("multiply works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.multiply(4)(5);
        expect(result).toBe(20);
        return null;
    }));
    it("divide works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.divide(20, 5);
        expect(result).toBe(4);
        return null;
    }));
    it("divide works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.divide(20)(5);
        expect(result).toBe(4);
        return null;
    }));
    it("modulo works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.modulo(23, 5);
        expect(result).toBe(3);
        return null;
    }));
    it("modulo works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.modulo(23)(5);
        expect(result).toBe(3);
        return null;
    }));
    it("negate works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.negate(23);
        expect(result).toBe(-23);
        return null;
    }));
});
describe("logic", () => {
    it("and works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.and(false, true);
        expect(result).toBe(false);
        return null;
    }));
    it("and works (true and true)", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.and(true, true);
        expect(result).toBe(true);
        return null;
    }));
    it("and works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.and(false)(true);
        expect(result).toBe(false);
        return null;
    }));
    it("or works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.or(false, true);
        expect(result).toBe(true);
        return null;
    }));
    it("or works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.or(false)(true);
        expect(result).toBe(true);
        return null;
    }));
    it("`not` works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.not(true);
        expect(result).toBe(false);
        return null;
    }));
});
describe("comparison", () => {
    it("eq works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.eq(4, 5);
        expect(result).toBe(false);
        return null;
    }));
    it("eq works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.eq(4)(4);
        expect(result).toBe(true);
        return null;
    }));
    it("neq works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.neq(4, 5);
        expect(result).toBe(true);
        return null;
    }));
    it("neq works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.neq(4)(4);
        expect(result).toBe(false);
        return null;
    }));
    it("gt works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.gt(4, 5);
        expect(result).toBe(false);
        return null;
    }));
    it("gt with equal values works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.gt(4, 4);
        expect(result).toBe(false);
        return null;
    }));
    it("gt works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.gt(5)(4);
        expect(result).toBe(true);
        return null;
    }));
    it("lt works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.lt(4, 5);
        expect(result).toBe(true);
        return null;
    }));
    it("lt with equal values works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.lt(4, 4);
        expect(result).toBe(false);
        return null;
    }));
    it("lt works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.lt(5)(4);
        expect(result).toBe(false);
        return null;
    }));
    it("gte works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.gte(4, 5);
        expect(result).toBe(false);
        return null;
    }));
    it("gte with equal values works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.gte(4, 4);
        expect(result).toBe(true);
        return null;
    }));
    it("gte works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.gte(5)(4);
        expect(result).toBe(true);
        return null;
    }));
    it("lte works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.lte(4, 5);
        expect(result).toBe(true);
        return null;
    }));
    it("lte with equal values works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.lte(4, 4);
        expect(result).toBe(true);
        return null;
    }));
    it("lte works with currying", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.lte(5)(4);
        expect(result).toBe(false);
        return null;
    }));
});
describe("condition", () => {
    it("works for first condition", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.condition([
            [X.lt, X.add],
            [X.gt, X.subtract],
        ], 2)(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("works for first condition, curried", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.condition([
            [X.lt, X.add],
            [X.gt, X.subtract],
        ], 2)(4)(5);
        expect(result).toBe(9);
        return null;
    }));
    it("works for second condition", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.condition([
            [X.lt, X.add],
            [X.gt, X.subtract],
        ], 2)(5, 4);
        expect(result).toBe(1);
        return null;
    }));
    it("works for invalid condition", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.condition([
            [X.lt, X.add],
            [X.gt, X.subtract],
        ], 2)(4, 4);
        expect(result).toBe(null);
        return null;
    }));
});
describe("T & F", () => {
    it("T works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.T();
        expect(result).toBe(true);
        return null;
    }));
    it("F works", () => __awaiter(this, void 0, void 0, function* () {
        const result = yield X.F();
        expect(result).toBe(false);
        return null;
    }));
});
//# sourceMappingURL=index.test.js.map