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
}));
describe("works with composition", () => __awaiter(this, void 0, void 0, function* () {
    it("composition works", () => __awaiter(this, void 0, void 0, function* () {
        try {
            function square(x) {
                return x * x;
            }
            const result = yield index_1.chiml([square, lib_1.minus], 9, 4);
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
//# sourceMappingURL=index.test.js.map