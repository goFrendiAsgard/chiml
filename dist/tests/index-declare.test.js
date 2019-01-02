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
            ins: ["a", "b"],
            out: "f",
            bootstrap: "run",
            injection: { asyncMinus: lib_1.asyncMinus, commandRootSquare: lib_1.commandRootSquare, nodebackMultiply: lib_1.nodebackMultiply, syncAdd: lib_1.syncAdd, R: index_1.R, X: index_1.X },
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
            ins: "num",
            bootstrap: "addFour",
            injection: { R: index_1.R },
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
        const main = index_1.X.declare({
            ins: ["num", "power"],
            bootstrap: "Math.pow",
            injection: { Math },
        });
        const result = main(5, 2);
        expect(result).toBe(25);
    });
    it("works with injected-dotted-element as component", () => {
        const main = index_1.X.declare({
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
        const main = index_1.X.declare({
            ins: "name",
            bootstrap: "sayHello",
            injection: { R: index_1.R },
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
                R: index_1.R,
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: {
                hi: "hello",
                R: index_1.R,
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
    it("works with component that try to change state, but the state itself should be immutable", () => {
        const main = index_1.X.declare({
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
        expect(result.num).toBe(1);
    });
    it("works with non-function component, and automatically translate it into function", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: {
                four: 4,
                five: 5,
                R: index_1.R,
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
        const main = index_1.X.declare({
            ins: ["n1", "n2"],
            bootstrap: "run",
            injection: { R: index_1.R, X: index_1.X },
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
        const main = index_1.X.declare({
            ins: ["n1", "n2"],
            bootstrap: "run",
            injection: { R: index_1.R, X: index_1.X },
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
    it("works with class createClassInitiator, createMethodExecutor, and createMethodEvaluator", () => {
        const main = index_1.X.declare({
            ins: "playerName",
            bootstrap: "run",
            injection: { Player: Player_1.Player, R: index_1.R, X: index_1.X },
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
                initPlayer: ["X.createClassInitiator", "${Player}"],
                setWeaponToFrostmourne: ["X.createMethodExecutor", "setWeapon", "Frostmourne"],
                setDamageTo50: ["X.createMethodExecutor", "setDamage", 50],
                attack: ["X.createMethodEvaluator", "attack"],
            },
        });
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });
    it("works with init class and execute", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player, R: index_1.R, X: index_1.X },
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
        const result = main();
        expect(result).toBe("Guldan attack with Rod, deal 10 damage");
    });
    it("works with init class and evaluate (evaluation params is undefined)", () => {
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player, R: index_1.R, X: index_1.X },
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player, R: index_1.R, X: index_1.X },
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { Player: Player_1.Player, R: index_1.R, X: index_1.X },
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { R: index_1.R, X: index_1.X, package: { lib: { Player: Player_1.Player } } },
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
        const main = index_1.X.declare({
            bootstrap: "run",
            injection: { initPlayer: Player_1.initPlayer, R: index_1.R, X: index_1.X },
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
    it("throw error when given circular state", () => {
        try {
            const main = index_1.X.declare({
                ins: "obj",
                out: "result",
                bootstrap: "run",
                injection: { R: index_1.R },
                component: {
                    run: {
                        ins: "obj",
                        out: "result",
                        perform: "R.prop",
                        parts: "circular",
                    },
                },
            });
            const obj = { circular: null };
            obj.circular = obj;
            const result = main(obj);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, bootstrap component `run( { circular: [Circular] } )`: " +
                "Cannot convert circular structure to Immutable");
        }
    });
    it("throw error if bootstrap's parameter is less than expected", () => {
        try {
            const main = index_1.X.declare({
                ins: "name",
                bootstrap: "sayHello",
                injection: { R: index_1.R },
                component: {
                    sayHello: {
                        perform: "R.concat",
                        parts: "Hello ",
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, bootstrap component `sayHello()`: Program expecting 1 arguments, but 0 given");
        }
    });
    it("throw error if component is not exists ", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "average",
                injection: { R: index_1.R },
                component: {
                    average: {
                        perform: "R.pipe",
                        parts: "${rataRata}",
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `average`: Part `rataRata` is not defined");
        }
    });
    it("throw error if bootstrap is not exists", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "oraono",
                injection: { R: index_1.R },
                component: {
                    nor: {
                        perform: "R.pipe",
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
    it("throw error if `perform` yield error", () => {
        try {
            const main = index_1.X.declare({
                injection: {
                    errorAction: () => { throw (new Error("invalid action")); },
                    R: index_1.R,
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
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `errorTest()`: invalid action");
        }
    });
    it("throw error if component yield error-object on execution", () => {
        try {
            const main = index_1.X.declare({
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
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    });
    it("throw error if component yield error-string on execution", () => {
        try {
            const main = index_1.X.declare({
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
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( 9 )`: I hate nine");
        }
    });
    it("throw error if component yield rejected Promise", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declare({
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
    it("throw error if component's perform is not executable", () => {
        try {
            const main = index_1.X.declare({
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
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: `four` is not a function");
        }
    });
    it("throw error when re-assign state", () => {
        try {
            const main = index_1.X.declare({
                ins: "flag",
                bootstrap: "run",
                injection: { R: index_1.R },
                component: {
                    run: {
                        ins: "flag",
                        out: "flag",
                        perform: "R.not",
                    },
                },
            });
            const result = main(true);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( true )`: Cannot reassign `flag`");
        }
    });
    it("throw error if component's perform not found", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                component: {
                    run: {
                        perform: "four",
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
                injection: { R: index_1.R },
                component: {
                    run: {
                        perform: "R.add",
                        parts: ["${four}", "${five}"]
                    },
                },
            });
            const result = main();
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Parse error, component `run`: Part `four` is not defined");
        }
    });
    it("throw error on infinite recursive call", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: { R: index_1.R },
                component: {
                    run: {
                        perform: "R.pipe",
                        parts: ["${run}"]
                    },
                },
            });
            const result = main(10);
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run( 10 )`: Maximum call stack size exceeded");
        }
    });
    it("throw error on undefined sub-part", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: { R: index_1.R, X: index_1.X },
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
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run()`: Component `package.lib.Player` is not defined");
        }
    });
    it("throw error when execution/evaluation not defined", () => {
        try {
            const main = index_1.X.declare({
                bootstrap: "run",
                injection: {
                    R: index_1.R, X: index_1.X,
                    testClass: class {
                        constructor() { }
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
            throw (new Error(`Expect error, but get result: ${result}`));
        }
        catch (error) {
            expect(error.message).toContain("Runtime error, component `run()`: `executions` or `evaluation` expected");
        }
    });
});
//# sourceMappingURL=index-declare.test.js.map