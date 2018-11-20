import { X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";

describe("declarative style", () => {

    it ("works", async () => {
        const main = X.declarative({
            ins: ["a", "b"],
            out: "f",
            bootstrap: "main",
            // parts can contains any values/JavaScript object
            injection: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd, ...X },
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
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

    it("works with non-string parameter", () => {
        const main = X.declarative({
            ins: "num",
            bootstrap: "addFour",
            injection: {...X},
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
        const main = X.declarative({
            ins: "name",
            bootstrap: "sayHello",
            injection: {...X},
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
            const main = X.declarative({
                bootstrap: "average",
                injection: {...X},
                component: {
                    average: {
                        pipe: "pipe",
                        parts: "<rataRata>",
                    },
                },
            });
            expect(true).toBeFalsy();
        } catch (error) {
            expect(error.message).toBe("Error parsing `average` component: Part `rataRata` is not defined");
        }
    });

    it("throw error if main is not exists", () => {
        try {
            const main = X.declarative({
                bootstrap: "oraono",
                injection: {...X},
                component: {
                    nor: {
                        pipe: "pipe",
                        parts: ["<or>", "<not>"],
                    },
                },
            });
            expect(true).toBeFalsy();
        } catch (error) {
            expect(error.message).toBe("Bootstrap component `oraono` is not defined");
        }
    });

    it("throw error if pipe yield error", () => {
        try {
            const main = X.declarative({
                injection: {
                    errorPipe: () => { throw(new Error("invalid pipe")); },
                        ...X,
                },
                component: {
                    errorTest: {
                        pipe: "errorPipe",
                        parts: ["<or>"],
                    },
                },
                bootstrap: "errorTest",
            });
            expect(true).toBeFalsy();
        } catch (error) {
            expect(error.message).toBe(
                "Error parsing `errorTest` component. " +
                    "Pipe `errorPipe` yield error: invalid pipe",
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
                    ...X,
                },
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
        } catch (error) {
            expect(error.message).toBe(
                "Error executing `main` component: I hate nine",
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
                    ...X,
                },
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
        } catch (error) {
            expect(error.message).toBe(
                "Error executing `main` component: I hate nine",
            );
        }
    });

    it("throw error if component yield rejected Promise", () => {
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
                ...X,
            },
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
        const main = X.declarative({
            ins: "_",
            out: "_",
            bootstrap: "main",
            injection: {
                main: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
                ...X,
            },
        });
        const result = main(9);
        result.then((val) => expect(true).toBeFalsy())
            .catch((error) => expect(error.message).toBe("Error executing `main` component: I hate nine"));
    });

});
