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
    it("works for normal config", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            ins: ["a", "b"],
            out: "f",
            bootstrap: "run",
            // parts can contains any values/JavaScript object
            injection: { asyncMinus: lib_1.asyncMinus, commandRootSquare: lib_1.commandRootSquare, nodebackMultiply: lib_1.nodebackMultiply, syncAdd: lib_1.syncAdd, X: index_1.X },
            // comp should only contains valid JSON object
            component: {
                run: {
                    perform: "X.pipeP",
                    parts: [
                        "${aPlusBAndAMinB}",
                        "${cByD}",
                        "${rootSquareE}",
                    ],
                },
                aPlusBAndAMinB: {
                    perform: "X.concurrent",
                    parts: ["${aPlusB}", "${aMinB}"],
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
                    perform: "X.wrapNodeback",
                    parts: "${nodebackMultiply}",
                },
                rootSquareE: {
                    ins: "e",
                    out: "f",
                    perform: "X.wrapCommand",
                    parts: ["${commandRootSquare}"],
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
            injection: { X: index_1.X },
            component: {
                addFour: {
                    ins: "num",
                    perform: "X.add",
                    parts: 4,
                },
            },
        });
        const result = main(3);
        expect(result).toBe(7);
    });
    it("works with injected-dotted-element as bootstrap", () => {
        const main = index_1.X.declarative({
            ins: ["num", "power"],
            bootstrap: "Math.pow",
            injection: { Math },
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });
    it("works with injected-dotted-element as component", () => {
        const main = index_1.X.declarative({
            ins: ["num", "power"],
            bootstrap: "powerBy",
            injection: { Math },
            component: {
                powerBy: {
                    ins: ["num", "power"],
                    perform: "Math.pow",
                },
            },
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });
    it("works with non-template-string parts", () => {
        const main = index_1.X.declarative({
            ins: "name",
            bootstrap: "sayHello",
            injection: { X: index_1.X },
            component: {
                sayHello: {
                    ins: "name",
                    perform: "X.concat",
                    parts: "Hello ",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("Hello world");
    });
    it("works with escaped template-string", () => {
        const main = index_1.X.declarative({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
                createAreaCalculator: (box) => () => {
                    return box.width * box.height;
                },
                X: index_1.X,
            },
            component: {
                run: {
                    perform: "createAreaCalculator",
                    parts: {
                        width: "${four}",
                        height: "${five}",
                    },
                },
            },
        });
        const result = main();
        expect(result).toBe(20);
    });
    it("works with nested template-string", () => {
        const main = index_1.X.declarative({
            bootstrap: "run",
            injection: {
                hi: "hello",
                X: index_1.X,
            },
            component: {
                run: {
                    perform: "X.concat",
                    parts: "\\${hi}",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("${hi}world");
    });
    it("state should be immutable", () => {
        const main = index_1.X.declarative({
            ins: "obj",
            out: "obj",
            bootstrap: "run",
            injection: {
                mutator: (obj) => obj.num++,
            },
            component: {
                run: {
                    ins: "obj",
                    perform: "mutator",
                },
            },
        });
        const result = main({ num: 1 });
        console.error(result);
        expect(result.num).toBe(1);
    });
    /*
    it("works when input state has circular reference", () => {
        const main = X.declarative({
            ins: "obj",
            out: "result",
            bootstrap: "run",
            injection: {
                X,
            },
            component: {
                run: {
                    ins: "obj",
                    out: "result",
                    perform: "X.prop",
                    parts: "num",
                },
            },
        });
        const obj = {num: 5, circular: null};
        obj.circular = obj;
        const result = main(obj);
        expect(result).toBe(5);
    });
    */
    it("automatically translate component into function", () => {
        const main = index_1.X.declarative({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
                X: index_1.X,
            },
            component: {
                run: {
                    perform: "X.add",
                    parts: ["${four}", "${five}"],
                },
            },
        });
        const result = main();
        expect(result).toBe(9);
    });
    it("throw error if bootstrap's given parameter is less than expected", () => {
        try {
            const main = index_1.X.declarative({
                ins: "name",
                bootstrap: "sayHello",
                injection: { X: index_1.X },
                component: {
                    sayHello: {
                        perform: "X.concat",
                        parts: "Hello ",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Program expecting 1 arguments, but 0 given");
        }
    });
    it("throw error if component is not exists ", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "average",
                injection: { X: index_1.X },
                component: {
                    average: {
                        perform: "X.pipe",
                        parts: "${rataRata}",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Parse error, component `average`: Part `rataRata` is not defined");
        }
    });
    it("throw error if bootstrap is not exists", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "oraono",
                injection: { X: index_1.X },
                component: {
                    nor: {
                        perform: "X.pipe",
                        parts: ["${X.or}", "${X.not}"],
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Bootstrap component `oraono` is not defined");
        }
    });
    it("throw error if pipe yield error", () => {
        try {
            const main = index_1.X.declarative({
                injection: {
                    errorAction: () => { throw (new Error("invalid action")); },
                    X: index_1.X,
                },
                component: {
                    errorTest: {
                        perform: "errorAction",
                        parts: ["${X.or}"],
                    },
                },
                bootstrap: "errorTest",
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Runtime error, component `errorTest()`: invalid action");
        }
    });
    it("throw error if component yield error-object on execution", () => {
        try {
            const main = index_1.X.declarative({
                ins: "n",
                out: "result",
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            throw (new Error("I hate nine"));
                        }
                        return val;
                    },
                    X: index_1.X,
                },
                component: {
                    run: {
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
            console.error(error.message);
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    });
    it("throw error if component yield error-string on execution", () => {
        try {
            const main = index_1.X.declarative({
                ins: "n",
                out: "result",
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            // tslint:disable
                            throw ("I hate nine");
                        }
                        return val;
                    },
                    X: index_1.X,
                },
                component: {
                    run: {
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
            console.error(error.message);
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    });
    it("throw error if component yield rejected Promise", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            ins: "n",
            out: "result",
            bootstrap: "run",
            injection: {
                errorComponent: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
                X: index_1.X,
            },
            component: {
                run: {
                    ins: "n",
                    out: "result",
                    perform: "errorComponent",
                },
            },
        });
        try {
            const result = yield main(9);
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    }));
    it("throw error if component yield rejected Promise, and only defined in injection", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            bootstrap: "run",
            injection: {
                run: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
                X: index_1.X,
            },
        });
        try {
            const result = yield main(9);
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    }));
    it("throw error if component's perform is not executable", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "run",
                injection: {
                    four: 4,
                    five: 5,
                    X: index_1.X,
                },
                component: {
                    run: {
                        perform: "four",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Parse error, component `run`: `four` is not a function");
        }
    });
    it("throw error when re-assign state", () => {
        try {
            const main = index_1.X.declarative({
                ins: "flag",
                bootstrap: "run",
                injection: {
                    X: index_1.X,
                },
                component: {
                    run: {
                        ins: "flag",
                        out: "flag",
                        perform: "X.not",
                    },
                },
            });
            const result = main(true);
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Runtime error, component `run( true )`: Cannot reassign `flag`");
        }
    });
    it("throw error if component's perform not found", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "run",
                injection: {
                    X: index_1.X,
                },
                component: {
                    run: {
                        perform: "four",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Parse error, component `run`: `four` is not a function");
        }
    });
    it("throw error if component's parts is not executable", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "run",
                injection: {
                    X: index_1.X,
                },
                component: {
                    run: {
                        perform: "X.add",
                        parts: ["${four}", "${five}"]
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Parse error, component `run`: Part `four` is not defined");
        }
    });
    it("throw error on infinite recursive call", () => {
        try {
            const main = index_1.X.declarative({
                bootstrap: "run",
                injection: {
                    X: index_1.X,
                },
                component: {
                    run: {
                        perform: "X.pipe",
                        parts: ["${run}"]
                    },
                },
            });
            const result = main(10);
            expect(true).toBeFalsy();
        }
        catch (error) {
            console.error(error.message);
            expect(error.message).toContain("Runtime error, component `run( 10 )`: Maximum call stack size exceeded");
        }
    });
});
//# sourceMappingURL=index-declarative.test.js.map