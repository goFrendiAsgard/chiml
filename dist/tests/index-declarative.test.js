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
describe("declarative style", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            ins: ["a", "b"],
            out: "f",
            bootstrap: "main",
            // parts can contains any values/JavaScript object
            injection: Object.assign({ asyncMinus: lib_1.asyncMinus, commandRootSquare: lib_1.commandRootSquare, nodebackMultiply: lib_1.nodebackMultiply, syncAdd: lib_1.syncAdd }, index_1.X),
            // comp should only contains valid JSON object
            component: {
                main: {
                    pipe: "pipeP",
                    parts: [
                        "<aPlusBAndAMinB>",
                        "<cByD>",
                        "<rootSquareE>",
                    ],
                },
                aPlusBAndAMinB: {
                    pipe: "concurrent",
                    parts: ["<aPlusB>", "<aMinB>"],
                },
                aPlusB: {
                    ins: ["a", "b"],
                    out: "c",
                    pipe: "syncAdd",
                },
                aMinB: {
                    ins: ["a", "b"],
                    out: "d",
                    pipe: "asyncMinus",
                },
                cByD: {
                    ins: ["c", "d"],
                    out: "e",
                    pipe: "wrapNodeback",
                    parts: "<nodebackMultiply>",
                },
                rootSquareE: {
                    ins: "e",
                    out: "f",
                    pipe: "wrapCommand",
                    parts: ["<commandRootSquare>"],
                },
            },
        });
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
    it("works with non-string parameter", () => {
        const main = index_1.X.declarative({
            ins: "num",
            bootstrap: "addFour",
            injection: Object.assign({}, index_1.X),
            component: {
                addFour: {
                    ins: "num",
                    pipe: "add",
                    parts: 4,
                },
            },
        });
        const result = main(3);
        expect(result).toBe(7);
    });
    it("works with non-template string parameter", () => {
        const main = index_1.X.declarative({
            ins: "name",
            bootstrap: "sayHello",
            injection: Object.assign({}, index_1.X),
            component: {
                sayHello: {
                    ins: "name",
                    pipe: "concat",
                    parts: "Hello ",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("Hello world");
    });
    it("throw error if component is not exists ", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "average",
                injection: Object.assign({}, index_1.X),
                component: {
                    average: {
                        pipe: "pipe",
                        parts: "<rataRata>",
                    },
                },
            });
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error parsing `average` component: Part `rataRata` is not defined");
        }
    });
    it("throw error if main is not exists", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "oraono",
                injection: Object.assign({}, index_1.X),
                component: {
                    nor: {
                        pipe: "pipe",
                        parts: ["<or>", "<not>"],
                    },
                },
            });
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Bootstrap component `oraono` is not defined");
        }
    });
    it("throw error if pipe yield error", () => {
        try {
            const main = index_1.X.declarative({
                injection: Object.assign({ errorPipe: () => { throw (new Error("invalid pipe")); } }, index_1.X),
                component: {
                    errorTest: {
                        pipe: "errorPipe",
                        parts: ["<or>"],
                    },
                },
                bootstrap: "errorTest",
            });
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error parsing `errorTest` component. " +
                "Pipe `errorPipe` yield error: invalid pipe");
        }
    });
    it("throw error if component yield error-object on execution", () => {
        try {
            const main = index_1.X.declarative({
                ins: "n",
                out: "result",
                bootstrap: "main",
                injection: Object.assign({ errorComponent: (val) => {
                        if (val === 9) {
                            throw (new Error("I hate nine"));
                        }
                        return val;
                    } }, index_1.X),
                component: {
                    main: {
                        ins: "n",
                        out: "result",
                        pipe: "errorComponent",
                    },
                },
            });
            const result = main(9);
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error executing `main` component: I hate nine");
        }
    });
    it("throw error if component yield error-string on execution", () => {
        try {
            const main = index_1.X.declarative({
                ins: "n",
                out: "result",
                bootstrap: "main",
                injection: Object.assign({ errorComponent: (val) => {
                        if (val === 9) {
                            // tslint:disable
                            throw ("I hate nine");
                        }
                        return val;
                    } }, index_1.X),
                component: {
                    main: {
                        ins: "n",
                        out: "result",
                        pipe: "errorComponent",
                    },
                },
            });
            const result = main(9);
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error executing `main` component: I hate nine");
        }
    });
    it("throw error if component yield rejected Promise", () => {
        const main = index_1.X.declarative({
            ins: "n",
            out: "result",
            bootstrap: "main",
            injection: Object.assign({ errorComponent: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                } }, index_1.X),
            component: {
                main: {
                    ins: "n",
                    out: "result",
                    pipe: "errorComponent",
                },
            },
        });
        const result = main(9);
        result.then((val) => expect(true).toBeFalsy())
            .catch((error) => expect(error.message).toBe("Error executing `main` component: I hate nine"));
    });
    it("throw error if component yield rejected Promise, and only defined in injection", () => {
        const main = index_1.X.declarative({
            ins: "_",
            out: "_",
            bootstrap: "main",
            injection: Object.assign({ main: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                } }, index_1.X),
        });
        const result = main(9);
        result.then((val) => expect(true).toBeFalsy())
            .catch((error) => expect(error.message).toBe("Error executing `main` component: I hate nine"));
    });
});
//# sourceMappingURL=index-declarative.test.js.map