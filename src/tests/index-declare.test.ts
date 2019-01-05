import { R, X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";
import { initPlayer, Player } from "./fixtures/Player";

describe("non-error declarative style", () => {

    it ("works for normal config", async () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd },
            component: {
                run: {
                    perform: "R.pipeP",
                    parts: [
                        "${plusAndMinus}",
                        "${spreadListAndMultiply}",
                        "${rootSquare}",
                    ],
                },
                plusAndMinus: {
                    perform: "X.concurrent",
                    parts: ["${syncAdd}", "${asyncMinus}"],
                },
                spreadListAndMultiply: {
                    perform: "R.apply",
                    parts: "${multiply}",
                },
                multiply: {
                    perform: "X.wrapNodeback",
                    parts: "${nodebackMultiply}",
                },
                rootSquare: {
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
            bootstrap: "addFour",
            component: {
                addFour: {
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
            bootstrap: "Math.pow",
            injection: {Math},
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });

    it("works with injected-dotted-element as component", () => {
        const main = X.declare({
            bootstrap: "powerBy",
            injection: {Math},
            component: {
                powerBy: {
                    perform: "Math.pow",
                },
            },
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });

    it("works with non-template-string parts", () => {
        const main = X.declare({
            bootstrap: "sayHello",
            component: {
                sayHello: {
                    perform: "R.concat",
                    parts: "Hello ",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("Hello world");
    });

    it("works with template-string", () => {
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

    it("works with escaped template-string", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
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

    it("works with escaped template-string that has no curly brace", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
            },
            component: {
                run: {
                    perform: "R.concat",
                    parts: "\\$hi",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("$hiworld");
    });

    it("works with no arity setting", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                join: (...args) => args.join("-"),
            },
            component: {
                run: {
                    perform: "join",
                },
            },
        });
        const result = main("a", "b", "c");
        expect(result).toBe("a-b-c");
    });

    it("works with arity setting", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                join: (...args) => args.join("-"),
            },
            component: {
                run: {
                    arity: 2,
                    perform: "join",
                },
            },
        });
        const result = main("a", "b", "c");
        expect(result).toBe("a-b");
    });

    it("works with non-function component, since it is automatically transformed into function", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
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

describe("brief syntax", () => {

    it("works with brief structure", () => {
        const main = X.declare({
            bootstrap: "run",
            component: {
                run: ["R.pipe", "${add}", "${addOne}"],
                add: "R.add",
                addOne: {
                    perform: ["R.add", 1],
                },
            },
        });
        const result = main(4, 5);
        expect(result).toBe(10);
    });

    it("works with brief component name without curly brace", () => {
        const main = X.declare({
            bootstrap: "run",
            component: {
                run: ["R.pipe", "$add", "$addOne"],
                add: "R.add",
                addOne: {
                    perform: ["R.add", 1],
                },
            },
        });
        const result = main(4, 5);
        expect(result).toBe(10);
    });

});

describe("non-error declarative style with class helpers", () => {

    it("works with class R.construct, getMethodExecutor, and getMethodEvaluator", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player },
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
                initPlayer: ["R.construct", "${Player}"],
                setWeaponToFrostmourne: ["X.getMethodExecutor", "setWeapon", "Frostmourne"],
                setDamageTo50: ["X.getMethodExecutor", "setDamage", 50],
                attack: ["X.getMethodEvaluator", "attack"],
            },
        });
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });

    it("works with init class and execute", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player },
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
                    perform: "X.getMethodEvaluator",
                    parts: "attack",
                },
            },
        });
        const result = main();
        expect(result).toBe("Guldan attack with Rod, deal 10 damage");
    });

    it("works with init class and evaluate (evaluation params is undefined)", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player },
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
        const result = main();
        expect(result).toBe("Thrall attack with Lightning Bolt, deal 30 damage");
    });

    it("works with init class and evaluate (init params is not an array, evaluation params is an empty array)", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player },
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
        const result = main();
        expect(result).toBe("Thrall attack with Lightning Bolt, deal 30 damage");
    });

    it("works with init class and evaluate that use brief-config", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { Player },
            component: {
                run: {
                    perform: "X.initClassAndRun",
                    parts: {
                        pipe: "${R.pipe}",
                        initClass: "${Player}",
                        initParams: "Thrall",
                        executions: [
                            ["setWeapon", "Lightning Bolt"],
                            ["setDamage", 30],
                        ],
                        evaluation: "attack",
                    },
                },
            },
        });
        const result = main();
        expect(result).toBe("Thrall attack with Lightning Bolt, deal 30 damage");
    });

    it("works when class constructor is on nested structure", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { package: {lib: { Player }} },
            component: {
                run: {
                    perform: "X.initClassAndRun",
                    parts: {
                        pipe: "${R.pipe}",
                        initClass: "${package.lib.Player}",
                        initParams: "Thrall",
                        executions: [
                            ["setWeapon", "Lightning Bolt"],
                            ["setDamage", 30],
                        ],
                        evaluation: "attack",
                    },
                },
            },
        });
        const result = main();
        expect(result).toBe("Thrall attack with Lightning Bolt, deal 30 damage");
    });

    it("works with init class and evaluate that use initFunction", () => {
        const main = X.declare({
            bootstrap: "run",
            injection: { initPlayer },
            component: {
                run: {
                    perform: "X.initClassAndRun",
                    parts: {
                        pipe: "${R.pipe}",
                        initFunction: "${initPlayer}",
                        initParams: "Thrall",
                        executions: [
                            ["setWeapon", "Lightning Bolt"],
                            ["setDamage", 30],
                        ],
                        evaluation: "attack",
                    },
                },
            },
        });
        const result = main();
        expect(result).toBe("Thrall attack with Lightning Bolt, deal 30 damage");
    });

});

describe("error declarative style", () => {

    it("throw error if component is not exists ", () => {
        try {
            const main = X.declare({
                bootstrap: "average",
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
                "Parse error, component `average`: Component `rataRata` is not defined",
            );
        }
    });

    it("throw error if bootstrap is not exists", () => {
        try {
            const main = X.declare({
                bootstrap: "oraono",
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
                "Parse error, component `run`: `four` is not defined",
            );
        }
    });

    it("throw error if component's parts is not executable", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
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
                "Parse error, component `run`: Component `four` is not defined",
            );
        }
    });

    it("throw error on infinite recursive call", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
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
                "Parse error, component `run`: Maximum call stack size exceeded",
            );
        }
    });

    it("throw error on undefined sub-part", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
                component: {
                    run: {
                        perform: "X.initClassAndRun",
                        parts: {
                            pipe: "${R.pipe}",
                            initClass: "${package.lib.Player}",
                            initParams: "Thrall",
                            executions: [
                                ["setWeapon", "Lightning Bolt"],
                                ["setDamage", 30],
                            ],
                            evaluation: "attack",
                        },
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Parse error, component `run`: Component `package.lib.Player` is not defined",
            );
        }
    });

    it("throw error when execution/evaluation not defined", () => {
        try {
            const main = X.declare({
                bootstrap: "run",
                injection: {
                    testClass: class{
                        constructor() {}
                    }
                },
                component: {
                    run: {
                        perform: "X.initClassAndRun",
                        parts: {
                            pipe: "${R.pipe}",
                            initClass: "${testClass}",
                            initParams: "Thrall",
                        },
                    },
                },
            });
            const result = main();
            throw(new Error(`Expect error, but get result: ${result}`));
        } catch (error) {
            expect(error.message).toContain(
                "Runtime error, component `run()`: `executions` or `evaluation` expected",
            );
        }
    });

});
