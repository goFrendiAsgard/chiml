import { X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";

describe("declarative style", () => {

    it ("works", async () => {
        const main = X.declarative({
            ins: ["a", "b"],
            out: "f",
            bootstrap: "main",
            // parts can contains any values/JavaScript object
            injection: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd, X },
            // comp should only contains valid JSON object
            component: {
                main: {
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
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

    it("works when returning promise", async () => {
        const main = X.declarative({
            bootstrap: "hello",
            injection: {
                hello: (name) => Promise.resolve(`Hello ${name}`),
            },
        });
        const result = await main("mantan");
        expect(result).toBe("Hello mantan");
        return null;
    });

    it("works with non-string parts", () => {
        const main = X.declarative({
            ins: "num",
            bootstrap: "addFour",
            injection: {X},
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

    it("works with non-template string parts", () => {
        const main = X.declarative({
            ins: "name",
            bootstrap: "sayHello",
            injection: {X},
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

    it("works with dotted injection as bootstrap", () => {
        const main = X.declarative({
            ins: ["num", "power"],
            bootstrap: "Math.pow",
            injection: {Math},
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });

    it("works with dotted injection as component", () => {
        const main = X.declarative({
            ins: ["num", "power"],
            bootstrap: "powerBy",
            injection: {Math},
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

    it("works with escaped parameter", () => {
        const main = X.declarative({
            bootstrap: "run",
            injection: {
                hi: "hello",
                X,
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

    it("works when input state has circular reference", () => {
        const main = X.declarative({
            ins: "obj",
            out: "result",
            bootstrap: "main",
            injection: {
                X,
            },
            component: {
                main: {
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

    it("throw error if bootstrap's given parameter is less than expected", () => {
        try {
            const main = X.declarative({
                ins: "name",
                bootstrap: "sayHello",
                injection: {X},
                component: {
                    sayHello: {
                        perform: "X.concat",
                        parts: "Hello ",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Program expecting 1 arguments, but 0 given",
            );
        }
    });

    it("throw error if component is not exists ", () => {
        try {
            const main = X.declarative({
                bootstrap: "average",
                injection: {X},
                component: {
                    average: {
                        perform: "X.pipe",
                        parts: "${rataRata}",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error parsing component `average`: Part `rataRata` is not defined",
            );
        }
    });

    it("throw error if bootstrap is not exists", () => {
        try {
            const main = X.declarative({
                bootstrap: "oraono",
                injection: {X},
                component: {
                    nor: {
                        perform: "X.pipe",
                        parts: ["${X.or}", "${X.not}"],
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Bootstrap component `oraono` is not defined",
            );
        }
    });

    it("throw error if pipe yield error", () => {
        try {
            const main = X.declarative({
                injection: {
                    errorAction: () => { throw(new Error("invalid action")); },
                    X,
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
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `errorTest()`: invalid action",
            );
        }
    });

    it("throw error if component yield error-object on execution", () => {
        try {
            const main = X.declarative({
                ins: "n",
                out: "result",
                bootstrap: "main",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            throw(new Error("I hate nine"));
                        }
                        return val;
                    },
                    X,
                },
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
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield error-string on execution", () => {
        try {
            const main = X.declarative({
                ins: "n",
                out: "result",
                bootstrap: "main",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            // tslint:disable
                            throw("I hate nine");
                        }
                        return val;
                    },
                    X,
                },
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
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield rejected Promise", async () => {
        const main = X.declarative({
            ins: "n",
            out: "result",
            bootstrap: "main",
            injection: {
                errorComponent: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
                X,
            },
            component: {
                main: {
                    ins: "n",
                    out: "result",
                    perform: "errorComponent",
                },
            },
        });
        try {
            const result = await main(9);
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield rejected Promise, and only defined in injection", async () => {
        const main = X.declarative({
            bootstrap: "main",
            injection: {
                main: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
                X,
            },
        });
        try {
            const result = await main(9);
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component's perform is not executable", () => {
        try {
            const main = X.declarative({
                bootstrap: "main",
                injection: {
                    four: 4,
                    five: 5,
                    X,
                },
                component: {
                    main: {
                        perform: "four",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error parsing component `main`: `four` is not a function",
            );
        }
    });

    it("throw error when re-assign state", () => {
        try {
            const main = X.declarative({
                ins: "flag",
                bootstrap: "main",
                injection: {
                    X,
                },
                component: {
                    main: {
                        ins: "flag",
                        out: "flag",
                        perform: "X.not",
                    },
                },
            });
            const result = main(true);
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main( true )`: Cannot reassign `flag`",
            );
        }
    });

    it("throw error when modify existing state", () => {
        try {
            const main = X.declarative({
                ins: "obj",
                bootstrap: "main",
                injection: {
                    mutator: (obj) => obj.num++,
                },
                component: {
                    main: {
                        ins: "obj",
                        perform: "mutator",
                    },
                },
            });
            const result = main({num: 1});
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main( { num: 1 } )`: Cannot assign to read only property 'num'",
            );
        }
    });

    it("throw error if component's perform(...parts) is not executable", () => {
        try {
            const main = X.declarative({
                bootstrap: "main",
                injection: {
                    four: 4,
                    five: 5,
                    X,
                },
                component: {
                    main: {
                        perform: "X.add",
                        parts: ["${four}", "${five}"]
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main()`: `X.add( 4, 5 )` is not a function",
            );
        }
    });

    it("throw error if component's perform not found", () => {
        try {
            const main = X.declarative({
                bootstrap: "main",
                injection: {
                    X,
                },
                component: {
                    main: {
                        perform: "four",
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error parsing component `main`: `four` is not a function",
            );
        }
    });

    it("throw error if component's parts is not executable", () => {
        try {
            const main = X.declarative({
                bootstrap: "main",
                injection: {
                    X,
                },
                component: {
                    main: {
                        perform: "X.add",
                        parts: ["${four}", "${five}"]
                    },
                },
            });
            const result = main();
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error parsing component `main`: Part `four` is not defined",
            );
        }
    });

    it("throw error on infinite recursive call", () => {
        try {
            const main = X.declarative({
                bootstrap: "main",
                injection: {
                    X,
                },
                component: {
                    main: {
                        perform: "X.pipe",
                        parts: ["${main}"]
                    },
                },
            });
            const result = main(10);
            expect(true).toBeFalsy();
        } catch (error) {
            console.error(error.message);
            expect(error.message).toContain(
                "Error executing component `main( 10 )`: Maximum call stack size exceeded",
            );
        }
    });

});
