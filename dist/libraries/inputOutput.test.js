"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputOutput_1 = require("./inputOutput");
it("able to print", (done) => {
    inputOutput_1.print("hello", (error, result) => {
        expect(error).toBeNull();
        done();
    });
});
//# sourceMappingURL=inputOutput.test.js.map