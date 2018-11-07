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
describe("wrap non promise and non function", () => {
    it("single number works", () => __awaiter(this, void 0, void 0, function* () {
        const addAndMinus = index_1.X.parallel(2, [lib_1.syncAdd, lib_1.asyncMinus]);
        const multiply = index_1.X.then(index_1.X.reduce(index_1.X.nodeback(2, lib_1.nodebackMultiply), 1));
        const rootSquare = index_1.X.then(index_1.X.command(1, lib_1.commandRootSquare));
        const main = (...args) => {
            return rootSquare(multiply(addAndMinus(...args)));
        };
        const result = yield main(10, 6);
        expect(result).toBe(8);
        return null;
    }));
});
//# sourceMappingURL=index.test.js.map