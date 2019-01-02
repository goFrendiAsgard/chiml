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
describe("foldInput", () => {
    it("works", () => {
        const fn = (...args) => index_1.R.sum(args);
        const foldedFn = index_1.X.foldInput(fn);
        const result = foldedFn([1, 2, 3]);
        expect(result).toBe(6);
    });
});
describe("spreadInput", () => {
    it("works", () => {
        const fn = (args) => index_1.R.sum(args);
        const spreadedFn = index_1.X.spreadInput(fn);
        const result = spreadedFn(1, 2, 3);
        expect(result).toBe(6);
    });
});
describe("wrapSync", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        const fn = (args) => index_1.R.sum(args);
        const wrapped = index_1.X.wrapSync(fn);
        const result = yield wrapped([1, 2, 3]);
        expect(result).toBe(6);
        return null;
    }));
});
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
    it("works", () => {
        const initPlayer = index_1.X.createClassInitiator(Player_1.Player);
        const setWeaponToFrostmourne = index_1.X.createMethodExecutor("setWeapon", "Frostmourne");
        const setDamageTo50 = index_1.X.createMethodExecutor("setDamage", 50);
        const attack = index_1.X.createMethodEvaluator("attack");
        const main = index_1.R.pipe(initPlayer, setWeaponToFrostmourne, setDamageTo50, attack);
        const result = main("Arthas");
        expect(result).toBe("Arthas attack with Frostmourne, deal 50 damage");
    });
});
describe("imperative style", () => {
    it("works", () => __awaiter(this, void 0, void 0, function* () {
        // composition
        const asyncRootSquare = index_1.X.wrapCommand(lib_1.commandRootSquare);
        const asyncMultiply = index_1.X.wrapNodeback(lib_1.nodebackMultiply);
        const asyncAdd = index_1.X.wrapSync(lib_1.syncAdd);
        const asyncAddAndMinus = index_1.X.concurrent(asyncAdd, lib_1.asyncMinus);
        const convergedAsyncMultiply = index_1.X.foldInput(asyncMultiply);
        const main = index_1.R.pipeP(asyncAddAndMinus, convergedAsyncMultiply, asyncRootSquare);
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
});
