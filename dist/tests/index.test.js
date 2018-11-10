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
describe("Case", () => {
    it("Imperative Style", () => __awaiter(this, void 0, void 0, function* () {
        // composition
        const asyncRootSquare = index_1.X.wrapCommand(lib_1.commandRootSquare);
        const asyncMultiply = index_1.X.wrapNodeback(lib_1.nodebackMultiply);
        const asyncAdd = index_1.X.wrapSync(lib_1.syncAdd);
        const asyncAddAndMinus = index_1.X.parallel(asyncAdd, lib_1.asyncMinus);
        const convergedAsyncMultiply = index_1.X.foldInput(asyncMultiply);
        const main = index_1.X.pipeP(asyncAddAndMinus, convergedAsyncMultiply, asyncRootSquare);
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
    it("Declarative Style", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            // vals can contains any values/JavaScript object
            vals: Object.assign({ asyncMinus: lib_1.asyncMinus, commandRootSquare: lib_1.commandRootSquare, nodebackMultiply: lib_1.nodebackMultiply, syncAdd: lib_1.syncAdd }, index_1.X),
            // comp should only contains valid JSON object
            comp: {
                asyncRootSquare: {
                    vals: ["<commandRootSquare>"],
                    pipe: "wrapCommand",
                },
                asyncMultiply: {
                    vals: ["<nodebackMultiply>"],
                    pipe: "wrapNodeback",
                },
                asyncAdd: {
                    vals: ["<syncAdd>"],
                    pipe: "wrapSync",
                },
                asyncAddAndMinus: {
                    vals: ["<asyncAdd>", "<asyncMinus>"],
                    pipe: "parallel",
                },
                convergedAsyncMultiply: {
                    vals: ["<asyncMultiply>"],
                    pipe: "foldInput",
                },
                main: {
                    vals: [
                        "<asyncAddAndMinus>",
                        "<convergedAsyncMultiply>",
                        "<asyncRootSquare>",
                    ],
                    pipe: "pipeP",
                },
            },
            main: "main",
        });
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
});
//# sourceMappingURL=index.test.js.map