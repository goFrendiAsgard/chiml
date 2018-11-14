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
describe("foldInput", () => {
    it("works", () => {
        const fn = (...args) => index_1.X.sum(args);
        const foldedFn = index_1.X.foldInput(fn);
        const result = foldedFn([1, 2, 3]);
        expect(result).toBe(6);
    });
});
describe("spreadInput", () => {
    it("works", () => {
        const fn = (args) => index_1.X.sum(args);
        const spreadedFn = index_1.X.spreadInput(fn);
        const result = spreadedFn(1, 2, 3);
        expect(result).toBe(6);
    });
});
describe("wrapSync", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const fn = (args) => index_1.X.sum(args);
        const wrapped = index_1.X.wrapSync(fn);
        const result = yield wrapped([1, 2, 3]);
        expect(result).toBe(6);
        return null;
    }));
});
describe("wrapNodeback", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const fn = (a, b, cb) => cb(null, a + b);
        const wrapped = index_1.X.wrapNodeback(fn);
        const result = yield wrapped(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("works on multiple-return", () => __awaiter(this, void 0, void 0, function* () {
        const fn = (a, b, cb) => cb(null, a + b, a - b);
        const wrapped = index_1.X.wrapNodeback(fn);
        const result = yield wrapped(4, 5);
        expect(result).toMatchObject([9, -1]);
        return null;
    }));
    it("throw error on callback-error", () => __awaiter(this, void 0, void 0, function* () {
        const fn = (cb) => cb("error");
        const wrapped = index_1.X.wrapNodeback(fn);
        try {
            const result = yield wrapped();
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBe("error");
        }
        return null;
    }));
});
describe("wrapCommand", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand(lib_1.commandRootSquare);
        const result = yield wrapped(4);
        expect(result).toBe(2);
        return null;
    }));
    it("works on non-json-parsable return", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo");
        const result = yield wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("works on single-word command", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo");
        const result = yield wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("works on command with templated-parameter", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo ${2} ${1}");
        const result = yield wrapped("world", "Hello");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("throw error on command-error", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("mantan not found");
        try {
            const result = yield wrapped();
            expect(result).toBeUndefined();
        }
        catch (error) {
            expect(error).toBeDefined();
        }
        return null;
    }));
});
describe("imperative style", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        // composition
        const asyncRootSquare = index_1.X.wrapCommand(lib_1.commandRootSquare);
        const asyncMultiply = index_1.X.wrapNodeback(lib_1.nodebackMultiply);
        const asyncAdd = index_1.X.wrapSync(lib_1.syncAdd);
        const asyncAddAndMinus = index_1.X.parallel(asyncAdd, lib_1.asyncMinus);
        const convergedAsyncMultiply = index_1.X.foldInput(asyncMultiply);
        const main = index_1.X.pipeP(asyncAddAndMinus, convergedAsyncMultiply, asyncRootSquare);
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
});
describe("declarative style", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            // parts can contains any values/JavaScript object
            injection: Object.assign({ asyncMinus: lib_1.asyncMinus, commandRootSquare: lib_1.commandRootSquare, nodebackMultiply: lib_1.nodebackMultiply, syncAdd: lib_1.syncAdd }, index_1.X),
            // comp should only contains valid JSON object
            component: {
                rootSquareE: {
                    ins: ["e"],
                    outs: ["f"],
                    pipe: "wrapCommand",
                    parts: ["<commandRootSquare>"],
                },
                cByD: {
                    ins: ["c", "d"],
                    outs: ["e"],
                    pipe: "wrapNodeback",
                    parts: ["<nodebackMultiply>"],
                },
                aPlusB: {
                    ins: ["a", "b"],
                    pipe: "wrapSync",
                    parts: ["<syncAdd>"],
                },
                aMinB: {
                    ins: ["a", "b"],
                    pipe: "asyncMinus",
                    parts: [],
                },
                aPlusBAndAMinB: {
                    outs: ["c", "d"],
                    pipe: "parallel",
                    parts: ["<aPlusB>", "<aMinB>"],
                },
                main: {
                    ins: ["a", "b"],
                    outs: ["f"],
                    pipe: "pipeP",
                    parts: [
                        "<aPlusBAndAMinB>",
                        "<cByD>",
                        "<rootSquareE>",
                    ],
                },
            },
            bootstrap: "main",
        });
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
    it("works with non-string parameter", () => {
        const main = index_1.X.declarative({
            injection: Object.assign({}, index_1.X),
            component: {
                addFour: {
                    pipe: "add",
                    parts: [4],
                },
            },
            bootstrap: "addFour",
        });
        const result = main(3);
        expect(result).toBe(7);
    });
    it("works with non-template string parameter", () => {
        const main = index_1.X.declarative({
            injection: Object.assign({}, index_1.X),
            component: {
                sayHello: {
                    pipe: "concat",
                    parts: ["Hello "],
                },
            },
            bootstrap: "sayHello",
        });
        const result = main("world");
        expect(result).toBe("Hello world");
    });
    it("throw error if component is not exists ", () => {
        try {
            const main = index_1.X.declarative({
                injection: Object.assign({}, index_1.X),
                component: {
                    average: {
                        pipe: "pipe",
                        parts: ["<rataRata>"],
                    },
                },
                bootstrap: "average",
            });
            expect(main).toBeUndefined();
        }
        catch (error) {
            expect(error.message).toBe("<rataRata> is not found");
        }
    });
    it("throw error if main is not exists", () => {
        try {
            const main = index_1.X.declarative({
                injection: Object.assign({}, index_1.X),
                component: {
                    nor: {
                        pipe: "pipe",
                        parts: ["<or>", "<not>"],
                    },
                },
                bootstrap: "oraono",
            });
            expect(main).toBeUndefined();
        }
        catch (error) {
            expect(error.message).toBe("oraono is not defined");
        }
    });
});
//# sourceMappingURL=index.test.js.map