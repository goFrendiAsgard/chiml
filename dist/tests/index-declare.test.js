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
const Player_1 = require("./fixtures/Player");
describe("non-error declarative style", () => {
    it("works for normal config", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { asyncMinus: lib_1.asyncMinus, commandRootSquare: lib_1.commandRootSquare, nodebackMultiply: lib_1.nodebackMultiply, syncAdd: lib_1.syncAdd },
            component: {
                run: {
                    setup: "R.pipeP",
                    parts: [
                        "${plusAndMinus}",
                        "${spreadListAndMultiply}",
                        "${rootSquare}",
                    ],
                },
                plusAndMinus: {
                    setup: "X.concurrent",
                    parts: ["${syncAdd}", "${asyncMinus}"],
                },
                spreadListAndMultiply: {
                    setup: "R.apply",
                    parts: "${multiply}",
                },
                multiply: {
                    setup: "X.wrapNodeback",
                    parts: "${nodebackMultiply}",
                },
                rootSquare: {
                    setup: "X.wrapCommand",
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
        const main = index_1.X.declare({
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
        const main = index_1.X.declare({
            bootstrap: "addFour",
            component: {
                addFour: {
                    setup: "R.add",
                    parts: 4,
                },
            },
        });
        const result = main(3);
        expect(result).toBe(7);
    });
    it("works with injected-dotted-element as bootstrap", () => {
        const main = index_1.X.declare({
            bootstrap: "Math.pow",
            injection: { Math },
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });
    it("works with injected-dotted-element as component", () => {
        const main = index_1.X.declare({
            bootstrap: "powerBy",
            injection: { Math },
            component: {
                powerBy: {
                    setup: "Math.pow",
                },
            },
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });
    it("works with non-template-string parts", () => {
        const main = index_1.X.declare({
            bootstrap: "sayHello",
            component: {
                sayHello: {
                    setup: "R.concat",
                    parts: "Hello ",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("Hello world");
    });
    it("works with template-string", () => {
        const main = index_1.X.declare({
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
                    setup: "createAreaCalculator",
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
            },
            component: {
                run: {
                    setup: "R.concat",
                    parts: "\\${hi}",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("${hi}world");
    });
    it("works with escaped template-string that has no curly brace", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
            },
            component: {
                run: {
                    setup: "R.concat",
                    parts: "\\$hi",
                },
            },
        });
        const result = main("world");
        expect(result).toBe("$hiworld");
    });
    it("works with no arity setting", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: {
                join: (...args) => args.join("-"),
            },
            component: {
                run: {
                    setup: "join",
                },
            },
        });
        const result = main("a", "b", "c");
        expect(result).toBe("a-b-c");
    });
    it("works with arity setting", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: {
                join: (...args) => args.join("-"),
            },
            component: {
                run: {
                    arity: 2,
                    setup: "join",
                },
            },
        });
        const result = main("a", "b", "c");
        expect(result).toBe("a-b");
    });
});
describe("brief syntax", () => {
    it("works with brief structure", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            component: {
                run: ["R.pipe", "${add}", "${addOne}"],
                add: "R.add",
                addOne: {
                    setup: ["R.add", 1],
                },
            },
        });
        const result = main(4, 5);
        expect(result).toBe(10);
    });
    it("works with brief component name without curly brace", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            component: {
                run: ["R.pipe", "$add", "$addOne"],
                add: "R.add",
                addOne: {
                    setup: ["R.add", 1],
                },
            },
        });
        const result = main(4, 5);
        expect(result).toBe(10);
    });
});
describe("non-error declarative style with class helpers", () => {
    it("works with class helper: R.construct, X.invoker", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player },
            component: {
                run: {
                    setup: "R.pipe",
                    parts: [
                        "${initPlayer}",
                        "${setWeaponToFrostmourne}",
                        "${R.last}",
                        "${setDamageTo50}",
                        "${R.last}",
                        "${attack}",
                        "${R.head}",
                    ],
                },
                initPlayer: ["R.construct", "${Player}"],
                setWeaponToFrostmourne: ["X.invoker", 1, "setWeapon", "Frostmourne"],
                setDamageTo50: ["X.invoker", 1, "setDamage", 50],
                attack: ["X.invoker", 0, "attack"],
            },
        });
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });
    it("works with init class and execute", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player },
            component: {
                run: {
                    setup: "R.pipe",
                    parts: ["${initPlayer}", "${attack}"],
                },
                initPlayer: {
                    setup: "X.initClassAndRun",
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
                    setup: "X.getMethodEvaluator",
                    parts: "attack",
                },
            },
        });
        const result = main();
        expect(result).toBe("Guldan attack with Rod, deal 10 damage");
    });
    it("works with init class and evaluate (evaluation params is undefined)", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player },
            component: {
                run: {
                    setup: "X.initClassAndRun",
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player },
            component: {
                run: {
                    setup: "X.initClassAndRun",
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player },
            component: {
                run: {
                    setup: "X.initClassAndRun",
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { package: { lib: { Player: Player_1.Player } } },
            component: {
                run: {
                    setup: "X.initClassAndRun",
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { initPlayer: Player_1.initPlayer },
            component: {
                run: {
                    setup: "X.initClassAndRun",
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
            const main = index_1.X.declare({
                bootstrap: "average",
                component: {
                    average: {
                        setup: "R.pipe",
                        parts: "${rataRata}",
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `average`: Component `rataRata` is not defined");
        }
    });
    it("throw error if bootstrap is not exists", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "oraono",
                component: {
                    nor: {
                        setup: "R.pipe",
                        parts: ["${R.or}", "${R.not}"],
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, bootstrap component `oraono`: `oraono` is not defined");
        }
    });
    it("throw error if `setup` yield error", () => {
        try {
            const main = index_1.X.declare({
                injection: {
                    errorAction: () => { throw (new Error("invalid action")); },
                },
                component: {
                    errorTest: {
                        setup: "errorAction",
                        parts: ["${R.or}"],
                    },
                },
                bootstrap: "errorTest",
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `errorTest`: invalid action");
        }
    });
    it("throw error when given non-function component", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: {
                    four: 4,
                    five: 5,
                },
                component: {
                    run: {
                        setup: "R.add",
                        parts: ["${four}", "${five}"],
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: Result of `R.add( 4, 5 )` is not a function");
        }
    });
    it("throw error if component yield error-object on execution", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            throw (new Error("I hate nine"));
                        }
                        return val;
                    },
                },
                component: {
                    run: {
                        setup: "errorComponent",
                    },
                },
            });
            const result = main(9);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    });
    it("throw error if component yield error-string on execution", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: {
                    errorComponent: (val) => {
                        if (val === 9) {
                            // tslint:disable
                            throw ("I hate nine");
                        }
                        return val;
                    },
                },
                component: {
                    run: {
                        setup: "errorComponent",
                    },
                },
            });
            const result = main(9);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    });
    it("throw error if component yield rejected Promise", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declare({
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
                    setup: "errorComponent",
                },
            },
        });
        try {
            const result = yield main(9);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    }));
    it("throw error if component yield rejected Promise", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declare({
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
            const result = yield main(9);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    }));
    it("throw error if component's setup is not executable", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: {
                    four: 4,
                    five: 5,
                },
                component: {
                    run: {
                        setup: "four",
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: `four` is not a function");
        }
    });
    it("throw error if component's setup not found", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                component: {
                    run: {
                        setup: "four",
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: `four` is not defined");
        }
    });
    it("throw error if component's parts is not executable", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                component: {
                    run: {
                        setup: "R.add",
                        parts: ["${four}", "${five}"]
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: Component `four` is not defined");
        }
    });
    it("throw error on infinite recursive call", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                component: {
                    run: {
                        setup: "R.pipe",
                        parts: ["${run}"]
                    },
                },
            });
            const result = main(10);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: Maximum call stack size exceeded");
        }
    });
    it("throw error on undefined sub-part", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                component: {
                    run: {
                        setup: "X.initClassAndRun",
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
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: Component `package.lib.Player` is not defined");
        }
    });
    it("throw error when execution/evaluation not defined", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: {
                    testClass: class {
                        constructor() { }
                    }
                },
                component: {
                    run: {
                        setup: "X.initClassAndRun",
                        parts: {
                            pipe: "${R.pipe}",
                            initClass: "${testClass}",
                            initParams: "Thrall",
                        },
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: `executions` or `evaluation` expected");
        }
    });
});
//# sourceMappingURL=index-declare.test.js.map