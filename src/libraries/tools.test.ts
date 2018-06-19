import {remove as fsRemove} from "fs-extra";
import {resolve as pathResolve} from "path";
import {cmdComposedCommand} from "./cmd";
import {compileChimlFile, execute, getCompiledScript} from "./tools";

it("run correct chiml script", (done) => {
  execute("(a, b) -> (x, y) => x + y", 4, 5).then((result) => {
    expect(result).toBe(9);
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("yield error when run incorrect chiml script", (done) => {
  execute("(a, b) -> (x, y) => {x + y", 4, 5).then((result) => {
    expect(result).toBeUndefined();
    done();
  }).catch((error) => {
    expect(error).toBeDefined();
    done();
  });
});

it("translate chiml into js", (done) => {
  getCompiledScript("(a, b) -> (x, y) => x + y").then((result) => {
    expect(result.split("\n").length).toBeGreaterThan(11);
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("yield error when translate incorrect chiml script", (done) => {
  getCompiledScript("(a, b) -> (x, y) => {x + y").then((result) => {
    expect(result).toBeUndefined();
    done();
  }).catch((error) => {
    expect(error).toBeDefined();
    done();
  });
});

it("compile testCompile/test.chiml", (done) => {
  const srcFilePath = pathResolve(__dirname, "testCompile/test.chiml");
  const compiledFilePath = pathResolve(__dirname, "testCompile/test.js");
  const libDirPath = pathResolve(__dirname, ".chiml");
  compileChimlFile(srcFilePath).then((result) => {
    return execute(srcFilePath, 10, 6);
  }).then((result) => {
    expect(result).toBe(64);
  }).then(() => {
    return cmdComposedCommand(`node ${compiledFilePath}`, [10, 8]);
  }).then((result) => {
    expect(result).toBe(36);
  }).then(() => {
    return fsRemove(compiledFilePath);
  }).then(() => {
    return fsRemove(libDirPath);
  }).then(done).catch((error) => {
    console.error(error);
    expect(error).toBeUndefined();
    done();
  });
});
