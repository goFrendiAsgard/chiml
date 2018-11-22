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
                    perform: "pipeP",
                    parts: [
                        "<aPlusBAndAMinB>",
                        "<cByD>",
                        "<rootSquareE>",
                    ],
                },
                aPlusBAndAMinB: {
                    perform: "concurrent",
                    parts: ["<aPlusB>", "<aMinB>"],
                },
                aPlusB: {
                    ins: ["a", "b"],
                    out: "c",
                    perform: "syncAdd",
                },
                aMinB: {
                    ins: ["a", "b"],
                    out: "d",
                    perform: "asyncMinus",
                },
                cByD: {
                    ins: ["c", "d"],
                    out: "e",
                    perform: "wrapNodeback",
                    parts: "<nodebackMultiply>",
                },
                rootSquareE: {
                    ins: "e",
                    out: "f",
                    perform: "wrapCommand",
                    parts: ["<commandRootSquare>"],
                },
            },
        });
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
    it("works when returning promise", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            bootstrap: "hello",
            injection: {
                hello: (name) => Promise.resolve(`Hello ${name}`),
            },
        });
        const result = yield main("mantan");
        expect(result).toBe("Hello mantan");
        return null;
    }));
    it("works with non-string parts", () => {
        const main = index_1.X.declarative({
            ins: "num",
            bootstrap: "addFour",
            injection: Object.assign({}, index_1.X),
            component: {
                addFour: {
                    ins: "num",
                    perform: "add",
                    parts: 4,
                },
            },
        });
        const result = main(3);
        expect(result).toBe(7);
    });
    it("works with non-template string parts", () => {
        const main = index_1.X.declarative({
            ins: "name",
            bootstrap: "sayHello",
            injection: Object.assign({}, index_1.X),
            component: {
                sayHello: {
                    ins: "name",
                    perform: "concat",
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
                        perform: "pipe",
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
                        perform: "pipe",
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
                injection: Object.assign({ errorAction: () => { throw (new Error("invalid action")); } }, index_1.X),
                component: {
                    errorTest: {
                        perform: "errorAction",
                        parts: ["<or>"],
                    },
                },
                bootstrap: "errorTest",
            });
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error parsing `errorTest` component. `errorAction` yield error: invalid action");
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
                        perform: "errorComponent",
                    },
                },
            });
            const result = main(9);
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error executing `main( 9 )` component: I hate nine");
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
                        perform: "errorComponent",
                    },
                },
            });
            const result = main(9);
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error executing `main( 9 )` component: I hate nine");
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
                    perform: "errorComponent",
                },
            },
        });
        const result = main(9);
        result.then((val) => expect(true).toBeFalsy())
            .catch((error) => expect(error.message).toBe("Error executing `main( 9 )` async component: I hate nine"));
    });
    it("throw error if component yield rejected Promise, and only defined in injection", () => {
        const main = index_1.X.declarative({
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
            .catch((error) => expect(error.message).toBe("Error executing `main( 9 )` async component: I hate nine"));
    });
    it("throw error if component's perform is not executable", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "main",
                injection: Object.assign({ four: 4, five: 5 }, index_1.X),
                component: {
                    main: {
                        perform: "four",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error parsing `main` component. `four` yield error: four is not a function");
        }
    });
    it("throw error if component's perform(...parts) is not executable", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "main",
                injection: Object.assign({ four: 4, five: 5 }, index_1.X),
                component: {
                    main: {
                        perform: "add",
                        parts: ["<four>", "<five>"]
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error.message).toBe("Error parsing `main` component. `add` yield error: add( 4, 5 ) is not a function");
        }
    });
});
//# sourceMappingURL=index-declarative.test.js.map