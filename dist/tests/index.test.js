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
        const result = yield X.pipe(lib_1.minus, lib_1.square)(9, 4);
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
});
describe("currying", () => {
    function myFunction(a, b, c, cb) {
        cb(null, a + b + c);
    }
    it("curry 1 param", () => __awaiter(this, void 0, void 0, function* () {
        const addOne = X.curry(myFunction, 3, 1);
        const result = yield addOne(5, 5);
        expect(result).toBe(11);
    }));
    it("curry 2 params", () => __awaiter(this, void 0, void 0, function* () {
        const addFive = X.curry(myFunction, 3, 4, 1);
        const result = yield addFive(4);
        expect(result).toBe(9);
    }));
    it("curry 1 params and curry again", () => __awaiter(this, void 0, void 0, function* () {
        const addOne = X.curry(myFunction, 3, 1);
        const addThree = X.curry(addOne, 2, 2);
        const result = yield addThree(5);
        expect(result).toBe(8);
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
    it("work with sync function", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield X.reduce((x, y) => x + y)(0, data);
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
        const result = yield X.pipe(X.parallel(X.wrap(lib_1.add)(n1, n2), X.wrap(lib_1.minus)(n1, n2)), X.curry(X.reduce(lib_1.multiply), 2, 1), lib_1.rootSquare)();
        expect(result).toBe(6);
        return null;
    }));
});
//# sourceMappingURL=index.test.js.map