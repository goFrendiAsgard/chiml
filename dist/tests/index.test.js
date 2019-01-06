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
describe("wrapNodeback", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const fn = (a, b, cb) => cb(null, a + b);
        const wrapped = index_1.X.wrapNodeback(fn);
        const result = yield wrapped(4, 5);
        expect(result).toBe(9);
        return null;
    }));
    it("works with multiple-return", () => __awaiter(this, void 0, void 0, function* () {
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
            expect(true).toBeFalsy();
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
    it("works with non-json-parsable return", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo");
        const result = yield wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("works with single-word command", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo");
        const result = yield wrapped("Hello world");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("works with command with ${PWD}", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo ${PWD}");
        const result = yield wrapped("Hello world");
        expect(result).toContain("Hello world");
        expect(result).toContain("chiml");
        return null;
    }));
    it("works with command that has templated-parameter", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo ${2} ${1}");
        const result = yield wrapped("world", "Hello");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("works with command that has escaped templated-parameter", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo ${2} \\${1}");
        const result = yield wrapped("world", "Hello");
        expect(result).toBe("Hello ${1}");
        return null;
    }));
    it("works with command that has templated-parameter, even if ins count is less than expected", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo ${2} ${1}");
        const result = yield wrapped("Hello");
        expect(result).toBe("Hello");
        return null;
    }));
    it("works with command that has templated-parameter, even if parameter index used more than once", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo ${2} ${2} ${1}");
        const result = yield wrapped("world", "Hello");
        expect(result).toBe("Hello Hello world");
        return null;
    }));
    it("works with command that has templated-parameter without curly brace", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo $2 $1");
        const result = yield wrapped("world", "Hello");
        expect(result).toBe("Hello world");
        return null;
    }));
    it("works with command that has escaped templated-parameter without curly brace", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("echo $2 \\$1");
        const result = yield wrapped("world", "Hello");
        expect(result).toBe("Hello $1");
        return null;
    }));
    it("throw error on command-error", () => __awaiter(this, void 0, void 0, function* () {
        const wrapped = index_1.X.wrapCommand("mantan not found");
        try {
            const result = yield wrapped();
            expect(true).toBeFalsy();
        }
        catch (error) {
            expect(error).toBeDefined();
        }
        return null;
    }));
});
describe("class helpers", () => {
    it("invoker works", () => {
        const initPlayer = index_1.R.construct(Player_1.Player);
        const setWeapon = index_1.X.invoker(1, "setWeapon", "Frostmourne");
        const setDamage = index_1.X.invoker(1, "setDamage");
        const attack = index_1.X.invoker(0, "attack");
        const main = index_1.R.pipe(initPlayer, setWeapon, index_1.R.last, setDamage(50), index_1.R.last, attack(), index_1.R.head);
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });
    it("fluent works", () => {
        const initPlayer = index_1.R.construct(Player_1.Player);
        const setDamageAndDoAttack = index_1.X.fluent([
            [1, "setWeapon", "Frostmourne"],
            [1, "setDamage"],
            [0, "attack"],
        ]);
        const main = index_1.R.pipe(initPlayer, setDamageAndDoAttack(50));
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });
    it("fluent works with no default parameters", () => {
        const initPlayer = index_1.R.construct(Player_1.Player);
        const setDamageAndDoAttack = index_1.X.fluent([
            [1, "setWeapon"],
            [1, "setDamage"],
            [0, "attack"],
        ]);
        const main = index_1.R.pipe(initPlayer, setDamageAndDoAttack("Frostmourne", 50));
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });
    it("initAndFluent works", () => {
        const initPlayer = index_1.R.construct(Player_1.Player);
        const main = index_1.X.initAndFluent([
            [1, initPlayer],
            [1, "setWeapon"],
            [1, "setDamage"],
            [0, "attack"],
        ]);
        const result = main("Arthas", "Frostmourne", 50);
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });
});
describe("imperative style", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        // composition
        const asyncRootSquare = index_1.X.wrapCommand(lib_1.commandRootSquare);
        const asyncMultiply = index_1.X.wrapNodeback(lib_1.nodebackMultiply);
        const asyncAddAndMinus = index_1.X.concurrent(lib_1.syncAdd, lib_1.asyncMinus);
        const spreadListAndMultiply = index_1.R.apply(asyncMultiply);
        const main = index_1.R.pipeP(asyncAddAndMinus, spreadListAndMultiply, asyncRootSquare);
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
});
//# sourceMappingURL=index.test.js.map