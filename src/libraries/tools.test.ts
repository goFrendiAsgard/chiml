import {remove as fsRemove} from "fs-extra";
import {dirname as pathDirName, resolve as pathResolve} from "path";
import {cmdComposedCommand} from "./cmd";
import {compile, execute, getCompiledScript} from "./tools";

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

const rootDirPath = pathDirName(pathDirName(__dirname));
const testDirPath = pathResolve(rootDirPath, "testcase", "compile");
const srcFilePath = pathResolve(testDirPath, "test.chiml");

it("ensure chiml file is executable", (done) => {
  execute(srcFilePath, 5, 4).then((result) => {
    expect(result).toBe(9);
    done();
  }).then(done).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("compile testCompile/test.chiml", (done) => {
  const compiledFilePath = pathResolve(testDirPath, "test.js");
  const nodeModulePath = pathResolve(testDirPath, "node_modules");
  compile([srcFilePath]).then(() => {
    return cmdComposedCommand(`node ${compiledFilePath}`, [10, 8]);
  }).then((result) => {
    expect(result).toBe(36);
  }).then(() => {
    return Promise.all([
      fsRemove(nodeModulePath),
      fsRemove(compiledFilePath),
    ]);
  }).then(() => {
    done();
  }).catch((error) => {
    console.error(error);
    expect(error).toBeUndefined();
    done();
  });
}, 10000);
