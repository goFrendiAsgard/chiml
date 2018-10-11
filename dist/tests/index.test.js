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
const index_1 = require("../index");
const lib_1 = require("./fixtures/lib");
describe("works with promises", () => __awaiter(this, void 0, void 0, function* () {
    it("single resolving promise works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.resolvingPromise);
            expect(result).toBe(73);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("multiple promise works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.resolvingPromise, lib_1.resolvingPromise);
            expect(result[0]).toBe(73);
            expect(result[1]).toBe(73);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("single rejecting promise works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.rejectingPromise);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("rejected");
        }
    }));
    it("multiple promise works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.rejectingPromise, lib_1.resolvingPromise);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("rejected");
        }
    }));
}));
describe("works with async functions", () => __awaiter(this, void 0, void 0, function* () {
    it("async function works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.asyncFunction, 4, 5);
            expect(result).toBe(9);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("async function that yield error works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.errorAsyncFunction, 4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("async function rejected");
        }
    }));
}));
describe("works with sync functions", () => __awaiter(this, void 0, void 0, function* () {
    it("sync function works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.syncFunction, 4, 5);
            expect(result).toBe(9);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("sync function that yield error works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.errorSyncFunction, 4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error.message).toBe("sync function error");
        }
    }));
}));
describe("works with functions that have node callback", () => __awaiter(this, void 0, void 0, function* () {
    it("function with callback works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.functionWithCallback, 4, 5);
            expect(result).toBe(9);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("function with callback and multiple results works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.functionWithCallbackAndMultipleReturn, 4, 5);
            expect(result[0]).toBe(9);
            expect(result[1]).toBe(-1);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("function with callback that yield error works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.functionWithCallbackYieldError, 4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("callback error");
        }
    }));
}));
describe("works with cmd", () => __awaiter(this, void 0, void 0, function* () {
    it("cmd works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.cmd, 4, 5);
            expect(result).toBe(9);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("cmd that return a non-json-parseable string works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml(lib_1.hello, "world");
            expect(result).toBe("Hello world");
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("cmd that contains single command works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml("ls");
            expect(result).toBeDefined();
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
    it("error cmd works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml("/dev/null/oraono", 4, 5);
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBeDefined();
        }
    }));
}));
describe("works with composition", () => __awaiter(this, void 0, void 0, function* () {
    it("composition works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield index_1.chiml([lib_1.square, lib_1.minus], 9, 4);
            expect(result).toBe(25);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
}));
describe("work", () => __awaiter(this, void 0, void 0, function* () {
    it("simple case works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            const n1 = 10;
            const n2 = 8;
            const [addResult, minusResult] = yield index_1.chiml(index_1.chiml(lib_1.add, n1, n2), index_1.chiml(lib_1.minus, n1, n2));
            expect(addResult).toBe(18);
            expect(minusResult).toBe(2);
            const result = yield index_1.chiml([lib_1.rootSquare, lib_1.multiply], addResult, minusResult);
            expect(result).toBe(6);
        }
        catch (error) {
            console.error(error);
            expect(error).toBeFalsy();
        }
    }));
}));
describe("map", () => __awaiter(this, void 0, void 0, function* () {
    it("work with sync function", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield index_1.chiml(index_1.map((x) => x * x), data);
        expect(result).toMatchObject([1, 4, 9, 16, 25]);
    }));
}));
describe("filter", () => __awaiter(this, void 0, void 0, function* () {
    it("work with sync function", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield index_1.chiml(index_1.filter((x) => x % 2 === 0), data);
        expect(result).toMatchObject([2, 4]);
    }));
}));
describe("reduce", () => __awaiter(this, void 0, void 0, function* () {
    it("work with sync function", () => __awaiter(this, void 0, void 0, function* () {
        const data = [1, 2, 3, 4, 5];
        const result = yield index_1.chiml(index_1.reduce((x, y) => x + y), data, 0);
        expect(result).toBe(15);
    }));
}));
//# sourceMappingURL=index.test.js.map