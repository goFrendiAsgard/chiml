"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const sandbox_1 = require("../../libraries/sandbox");
test("construct sandbox for `(a) --> b`", () => {
    const result = sandbox_1.createSandbox("(a) --> b");
    expect(result.__filename).toBe(path_1.resolve(process.cwd(), "virtual"));
    expect(result.__dirname).toBe(process.cwd());
});
test("construct sandbox for `/somewhere/over/theRainbow.chiml`", () => {
    const result = sandbox_1.createSandbox("/somewhere/over/theRainbow.chiml");
    expect(result.__filename).toBe("/somewhere/over/theRainbow.chiml");
    expect(result.__dirname).toBe("/somewhere/over");
});
