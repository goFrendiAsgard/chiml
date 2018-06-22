import {dirname as pathDirName, resolve as pathResolve} from "path";
import {createSandbox} from "./sandbox";

it("construct sandbox for `(a) --> b`", (done) => {
  const result = createSandbox("(a) --> b");
  expect(result.__filename).toBe(pathResolve(process.cwd(), "virtual"));
  expect(result.__dirname).toBe(process.cwd());
  done();
});

it("construct sandbox for `/somewhere/over/theRainbow.chiml`", (done) => {
  const result = createSandbox("/somewhere/over/theRainbow.chiml");
  expect(result.__filename).toBe("/somewhere/over/theRainbow.chiml");
  expect(result.__dirname).toBe("/somewhere/over");
  done();
});
