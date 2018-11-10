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
        const asyncAddAndMinus = index_1.X.parallel([asyncAdd, lib_1.asyncMinus]);
        const convergedAsyncMultiply = index_1.X.convergeInput(asyncMultiply);
        const main = index_1.X.pipeP(asyncAddAndMinus, convergedAsyncMultiply, asyncRootSquare);
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
    it("Declarative Style", () => __awaiter(this, void 0, void 0, function* () {
        const main = index_1.X.declarative({
            // define can contains any valid javascript object
            definition: { asyncMinus: lib_1.asyncMinus, commandRootSquare: lib_1.commandRootSquare, nodebackMultiply: lib_1.nodebackMultiply, syncAdd: lib_1.syncAdd },
            // declare and main should only contains valid JSON object
            declaration: {
                asyncAdd: {
                    wrapSync: [2, "<syncAdd>"],
                },
                asyncAddAndMinus: {
                    parallel: [2, ["<asyncAdd>", "<asyncMinus>"]],
                },
                asyncMultiply: {
                    wrapNodeback: [2, "<nodebackMultiply>"],
                },
                asyncRootSquare: {
                    wrapCommand: [1, "<commandRootSquare>"],
                },
                convergedAsyncMultiply: {
                    convergeInput: ["<asyncMultiply>"],
                },
                mainAction: {
                    pipeP: [
                        "<asyncAddAndMinus>",
                        "<convergedAsyncMultiply>",
                        "<asyncRootSquare>",
                    ],
                },
            },
            action: "mainAction",
        });
        // action
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
});
//# sourceMappingURL=index.test.js.map