import { dirname as pathDirName, resolve as pathResolve } from "path";
import { createSandbox } from "../../libraries/sandbox";

test("construct sandbox for `(a) --> b`", () => {
    const result = createSandbox("(a) --> b");
    expect(result.__filename).toBe(pathResolve(process.cwd(), "virtual"));
    expect(result.__dirname).toBe(process.cwd());
});

test("construct sandbox for `/somewhere/over/theRainbow.chiml`", () => {
    const result = createSandbox("/somewhere/over/theRainbow.chiml");
    expect(result.__filename).toBe("/somewhere/over/theRainbow.chiml");
    expect(result.__dirname).toBe("/somewhere/over");
});
