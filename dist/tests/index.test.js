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
const chiml = require("../index");
describe("Translate async function into promise", () => __awaiter(this, void 0, void 0, function* () {
    it("Translate async function", () => __awaiter(this, void 0, void 0, function* () {
        function fn(a, b) {
            return __awaiter(this, void 0, void 0, function* () {
                return a + b;
            });
        }
        const result = yield chiml.a(fn)(4, 5);
        expect(result).toBe(9);
    }));
}));
describe("Translate node callback into promise", () => __awaiter(this, void 0, void 0, function* () {
    it("Translate node callback with single result", () => __awaiter(this, void 0, void 0, function* () {
        function fn(a, b, callback) {
            callback(null, a + b);
        }
        const result = yield chiml.c(fn)(4, 5);
        expect(result).toBe(9);
    }));
    it("Translate node callback with multiple results", () => __awaiter(this, void 0, void 0, function* () {
        function fn(a, b, callback) {
            callback(null, a + b, a - b);
        }
        const result = yield chiml.c(fn)(4, 5);
        expect(result).toMatchObject([9, -1]);
    }));
    it("Translate node callback that yield error", () => __awaiter(this, void 0, void 0, function* () {
        function fn(a, b, callback) {
            callback("error bro", a + b);
        }
        try {
            yield chiml.c(fn)(4, 5);
        }
        catch (error) {
            expect(error).toBe("error bro");
        }
    }));
}));
describe("Translate sync function into promise", () => __awaiter(this, void 0, void 0, function* () {
    it("Translate sync function", () => __awaiter(this, void 0, void 0, function* () {
        function fn(a, b) {
            return a + b;
        }
        const result = yield chiml.s(fn)(4, 5);
        expect(result).toBe(9);
    }));
    it("Translate sync function that yield error", () => __awaiter(this, void 0, void 0, function* () {
        function fn(a, b) {
            throw (new Error("error bro"));
        }
        try {
            yield chiml.s(fn)(4, 5);
        }
        catch (error) {
            expect(error.message).toBe("error bro");
        }
    }));
}));
//# sourceMappingURL=index.test.js.map