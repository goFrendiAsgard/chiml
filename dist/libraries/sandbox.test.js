"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const sandbox_1 = require("./sandbox");
it("construct sandbox for `(a) --> b`", (done) => {
    const result = sandbox_1.createSandbox("(a) --> b");
    expect(result.__filename).toBe(path_1.resolve(process.cwd(), "virtual"));
    expect(result.__dirname).toBe(process.cwd());
    done();
});
it("construct sandbox for `/somewhere/over/theRainbow.chiml`", (done) => {
    const result = sandbox_1.createSandbox("/somewhere/over/theRainbow.chiml");
    expect(result.__filename).toBe("/somewhere/over/theRainbow.chiml");
    expect(result.__dirname).toBe("/somewhere/over");
    done();
});
//# sourceMappingURL=sandbox.test.js.map