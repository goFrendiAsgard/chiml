import { R, X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";
import { Player } from "./fixtures/Player";

describe("non-error declarative style", () => {

    it ("works for normal config", async () => {
        const main = X.declare({
            ins: ["a", "b"],
            out: "f",
            bootstrap: "run",
            // parts can contains any values/JavaScript object
            injection: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd, R, X },
            // comp should only contains valid JSON object
            component: {
                run: {
                    perform: "R.pipeP",
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
        const main = X.declare({
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
        const main = X.declare({
            ins: "num",
            bootstrap: "addFour",
            injection: { R },
            component: {
                addFour: {
                    ins: "num",
                    perform: "R.add",
                    parts: 4,
                },
            },
        });
        const result = main(3);
        expect(result).toBe(7);
    });

    it("works with injected-dotted-element as bootstrap", () => {
        const main = X.declare({
            ins: ["num", "power"],
            bootstrap: "Math.pow",
            injection: {Math},
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });

    it("works with injected-dotted-element as component", () => {
        const main = X.declare({
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

    it("works with non-template-string parts", () => {
        const main = X.declare({
            ins: "name",
            bootstrap: "sayHello",
            injection: { R },
            component: {
                sayHello: {
                    ins: "name",
                    perform: "R.concat",
                    parts: "Hello ",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("Hello world");
    });

    it("works with escaped template-string", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
                createAreaCalculator: (box) => () => {
                    return box.width * box.height;
                },
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
        const main = X.declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
                R,
            },
            component: {
                run: {
                    perform: "R.concat",
                    parts: "\\${hi}",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("${hi}world");
    });

    it("works with component that try to change state, but the state itself should be immutable", () => {
        const main = X.declare({
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
        const result = main({num: 1});
        expect(result.num).toBe(1);
    });

    it("works with non-function component, and automatically translate it into function", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
                R,
            },
            component: {
                run: {
                    perform: "R.add",
                    parts: ["${four}", "${five}"],
                },
            },
        });
        const result = main();
        expect(result).toBe(9);
    });

});

describe("non-error declarative style with class helpers", () => {

    it("works with class createClassInitiator, createMethodExecutor, and createMethodEvaluator", () => {
        const main = X.declare({
            ins: "playerName",
            bootstrap: "run",
            injection: { Player, R, X },
            component: {
                run: {
                    perform: "R.pipe",
                    parts: [
                        "${initPlayer}",
                        "${setWeaponToFrostmourne}",
                        "${setDamageTo50}",
                        "${attack}",
                    ],
                },
                initPlayer: {
                    perform: "X.createClassInitiator",
                    parts: "${Player}",
                },
                setWeaponToFrostmourne: {
                    perform: "X.createMethodExecutor",
                    parts: ["setWeapon", "Frostmourne"],
                },
                setDamageTo50: {
                    perform: "X.createMethodExecutor",
                    parts: ["setDamage", 50],
                },
                attack: {
                    perform: "X.createMethodEvaluator",
                    parts: "attack",
                },
            },
        });
        const status = main("Arthas");
        expect(status).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

    it("works with init class and execute", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player, R, X },
            component: {
                run: {
                    perform: "R.pipe",
                    parts: ["${initPlayer}", "${attack}"],
                },
                initPlayer: {
                    perform: "X.initClassAndRun",
                    parts: {
                        pipe: "${R.pipe}",
                        initClass: "${Player}",
                        initParams: ["Guldan"],
                        executions: [
                            {
                                method: "setWeapon",
                                params: ["Rod"],
                            },
                            {
                                method: "setDamage",
                                params: 10,
                            },
                        ],
                    },
                },
                attack: {
                    perform: "X.createMethodEvaluator",
                    parts: "attack",
                },
            },
        });
        const status = main();
        expect(status).toBe("Guldan attack with Rod, deal 10 damage");
    });

    it("works with init class and evaluate (evaluation params is undefined)", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player, R, X },
            component: {
                run: {
                    perform: "X.initClassAndRun",
                    parts: {
                        pipe: "${R.pipe}",
                        initClass: "${Player}",
                        initParams: ["Thrall"],
                        executions: [
                            {
                                method: "setWeapon",
                                params: ["Lightning Bolt"],
                            },
                            {
                                method: "setDamage",
                                params: 30,
                            },
                        ],
                        evaluation: {
                            method: "attack",
                            params: undefined,
                        },
                    },
                },
            },
        });
        const status = main();
        expect(status).toBe("Thrall attack with Lightning Bolt, deal 30 damage");
    });

    it("works with init class and evaluate (init params is not an array, evaluation params is an empty array)", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player, R, X },
            component: {
                run: {
                    perform: "X.initClassAndRun",
                    parts: {
                        pipe: "${R.pipe}",
                        initClass: "${Player}",
                        initParams: "Thrall",
                        executions: [
                            {
                                method: "setWeapon",
                                params: ["Lightning Bolt"],
                            },
                            {
                                method: "setDamage",
                                params: 30,
                            },
                        ],
                        evaluation: {
                            method: "attack",
                            params: [],
                        },
                    },
                },
            },
        });
        const status = main();
        expect(status).toBe("Thrall attack with Lightning Bolt, deal 30 damage");
    });

});

describe("error declarative style", () => {

    it("throw error when given circular state", () => {
        try {
            const main = X.declare({
                ins: "obj",
                out: "result",
                bootstrap: "run",
                injection: { R },
                component: {
                    run: {
                        ins: "obj",
                        out: "result",
                        perform: "R.prop",
                        parts: "circular",
                    },
                },
            });
            const obj = {circular: null};
            obj.circular = obj;
            const result = main(obj);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, bootstrap component `run( { circular: [Circular] } )`: " +
                "Cannot convert circular structure to Immutable",
            );
        }
    });

    it("throw error if bootstrap's parameter is less than expected", () => {
        try {
            const main = X.declare({
                ins: "name",
                bootstrap: "sayHello",
                injection: { R },
                component: {
                    sayHello: {
                        perform: "R.concat",
                        parts: "Hello ",
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, bootstrap component `sayHello()`: Program expecting 1 arguments, but 0 given",
            );
        }
    });

    it("throw error if component is not exists ", () => {
        try {
            const main = X.declare({
                bootstrap: "average",
                injection: { R },
                component: {
                    average: {
                        perform: "R.pipe",
                        parts: "${rataRata}",
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `average`: Part `rataRata` is not defined",
            );
        }
    });

    it("throw error if bootstrap is not exists", () => {
        try {
            const main = X.declare({
                bootstrap: "oraono",
                injection: { R },
                component: {
                    nor: {
                        perform: "R.pipe",
                        parts: ["${R.or}", "${R.not}"],
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, bootstrap component `oraono`: `oraono` is not defined",
            );
        }
    });

    it("throw error if `perform` yield error", () => {
        try {
            const main = X.declare({
                injection: {
                    errorAction: () => { throw(new Error("invalid action")); },
                    R,
                },
                component: {
                    errorTest: {
                        perform: "errorAction",
                        parts: ["${R.or}"],
                    },
                },
                bootstrap: "errorTest",
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `errorTest()`: invalid action",
            );
        }
    });

    it("throw error if component yield error-object on execution", () => {
        try {
            const main = X.declare({
                ins: "n",
                out: "result",
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            throw(new Error("I hate nine"));
                        }
                        return val;
                    },
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
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield error-string on execution", () => {
        try {
            const main = X.declare({
                ins: "n",
                out: "result",
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            // tslint:disable
                            throw("I hate nine");
                        }
                        return val;
                    },
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
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield rejected Promise", async () => {
        const main = X.declare({
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
            const result = await main(9);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component yield rejected Promise", async () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                run: (val) => {
                    if (val === 9) {
                        return Promise.reject("I hate nine");
                    }
                    return Promise.resolve(val);
                },
            },
        });
        try {
            const result = await main(9);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 9 )`: I hate nine",
            );
        }
    });

    it("throw error if component's perform is not executable", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
                injection: {
                    four: 4,
                    five: 5,
                },
                component: {
                    run: {
                        perform: "four",
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: `four` is not a function",
            );
        }
    });

    it("throw error when re-assign state", () => {
        try {
            const main = X.declare({
                ins: "flag",
                bootstrap: "run",
                injection: { R },
                component: {
                    run: {
                        ins: "flag",
                        out: "flag",
                        perform: "R.not",
                    },
                },
            });
            const result = main(true);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( true )`: Cannot reassign `flag`",
            );
        }
    });

    it("throw error if component's perform not found", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
                component: {
                    run: {
                        perform: "four",
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: `four` is not a function",
            );
        }
    });

    it("throw error if component's parts is not executable", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
                injection: { R },
                component: {
                    run: {
                        perform: "R.add",
                        parts: ["${four}", "${five}"]
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: Part `four` is not defined",
            );
        }
    });

    it("throw error on infinite recursive call", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
                injection: { R },
                component: {
                    run: {
                        perform: "R.pipe",
                        parts: ["${run}"]
                    },
                },
            });
            const result = main(10);
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run( 10 )`: Maximum call stack size exceeded",
            );
        }
    });

});
