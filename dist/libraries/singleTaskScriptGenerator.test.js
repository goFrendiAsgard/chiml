"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
const SingleTask_1 = require("../classes/SingleTask");
const singleTaskScriptGenerator_1 = require("./singleTaskScriptGenerator");
const chimlSample = `
ins: pairs                                                        # 0
out: result
do:

  - parallel:                                                     # 0_0
    - map: pairs                                                  # 0_0_0
      into: hypothenuses
      do: "(pair) -> (x) => x[0] * x[0] + x[1] * x[1]"

    - reduce: pairs                                               # 0_0_1
      into: total
      do: "(pair, accumulator) -> (x, y) => x[0] + x[1] + y"

    - filter: pairs                                               # 0_0_2
      into: isosceles
      do: "(pair) -> (x) => x[0] === x[1]"

  - biggestIsosceles <-- 0                                        # 0_1
  - i <-- 0                                                       # 0_2
  - do:                                                           # 0_3
    - if: isosceles[i] > biggestIsosceles                         # 0_3_0
      do: "biggestIsosceles <-- isosceles[i]"
    - i <-- i+1                                                   # 0_3_1
    while: i < isosceles.length

  - "{pairs, isosceles, total, biggestIsosceles} --> result"      # 0_4
`;
const taskSample = new SingleTask_1.SingleTask(js_yaml_1.safeLoad(chimlSample));
it("fetch variables from taskSample", (done) => {
    const vars00 = singleTaskScriptGenerator_1.getVariables(taskSample);
    expect(vars00.length).toBe(6);
    expect(vars00).toContain("hypothenuses");
    expect(vars00).toContain("total");
    expect(vars00).toContain("isosceles");
    expect(vars00).toContain("biggestIsosceles");
    expect(vars00).toContain("i");
    expect(vars00).toContain("result");
    const vars000 = singleTaskScriptGenerator_1.getVariables(taskSample.commandList[0].commandList[0]);
    expect(vars000.length).toBe(1);
    expect(vars000).toContain("__ans");
    done();
});
it("fetch variables from miniTask `(a) -> (x) => x+1 -> a`", (done) => {
    const miniTask = new SingleTask_1.SingleTask("(a) -> (x) => x+1 -> a");
    const miniVars = singleTaskScriptGenerator_1.getVariables(miniTask);
    expect(miniVars.length).toBe(0);
    done();
});
it("render template correctly", (done) => {
    const template = "function <%= functionName %> (<%= inputs.join(', ') %>){\n" +
        "  vars <%= vars.join(', ') %>;\n" +
        "  return true;\n" +
        "}";
    const config = { functionName: "fn", inputs: ["n1", "n2"], vars: ["a", "b", "c"] };
    const expect1 = "function fn (n1, n2){\n" +
        "  vars a, b, c;\n" +
        "  return true;\n" +
        "}";
    const result1 = singleTaskScriptGenerator_1.renderTemplate(template, config);
    expect(result1).toBe(expect1);
    const expect2 = "  function fn (n1, n2){\n" +
        "    vars a, b, c;\n" +
        "    return true;\n" +
        "  }";
    const result2 = singleTaskScriptGenerator_1.renderTemplate(template, config, 2);
    expect(result2).toBe(expect2);
    done();
});
it("createHandlerScript", (done) => {
    const scriptPath = (path_1.resolve(__dirname, "cmd.test.add.js"));
    const resultCmd = singleTaskScriptGenerator_1.createHandlerScript(new SingleTask_1.SingleTask(`(a,b) -> node ${scriptPath}`));
    const resultAsync = singleTaskScriptGenerator_1.createHandlerScript(new SingleTask_1.SingleTask("(a,b) -> [(x, y, callback) => callback(null, x + y)]"));
    const resultSync = singleTaskScriptGenerator_1.createHandlerScript(new SingleTask_1.SingleTask("(a,b) -> (x, y) => x + y"));
    const resultPromise = singleTaskScriptGenerator_1.createHandlerScript(new SingleTask_1.SingleTask("(a,b) -> <Promise.resolve(a + b)>"));
    const resultSeries = singleTaskScriptGenerator_1.createHandlerScript(new SingleTask_1.SingleTask({
        do: [
            "(a) -> (x) => x + 1 -> b",
            "(b) -> (x) => x * 2",
        ],
        ins: "a",
    }));
    const resultParallel = singleTaskScriptGenerator_1.createHandlerScript(new SingleTask_1.SingleTask({
        ins: "a",
        parallel: [
            "(a) -> (x) => x + 1",
            "(a) -> (x) => x * 2",
        ],
    }));
    for (const script of [resultCmd, resultAsync, resultSync, resultPromise, resultSeries, resultParallel]) {
        console.log(script);
    }
    done();
});
//# sourceMappingURL=singleTaskScriptGenerator.test.js.map