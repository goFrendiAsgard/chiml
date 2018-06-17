import {safeLoad} from "js-yaml";
import {resolve} from "path";
import {runInNewContext} from "vm";
import {SingleTask} from "../classes/SingleTask";
import {ISingleTask} from "../interfaces/ISingleTask";
import {cmdComposedCommand} from "./cmd";
import {createHandlerScript, getVariables, renderTemplate} from "./singleTaskScriptGenerator";
import {doubleQuote} from "./stringUtil";

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

it("fetch variables from taskSample", (done) => {
  const taskSample = new SingleTask(safeLoad(chimlSample));
  const vars00 = getVariables(taskSample);
  expect(vars00.length).toBe(6);
  expect(vars00).toContain("hypothenuses");
  expect(vars00).toContain("total");
  expect(vars00).toContain("isosceles");
  expect(vars00).toContain("biggestIsosceles");
  expect(vars00).toContain("i");
  expect(vars00).toContain("result");

  const vars000 = getVariables(taskSample.commandList[0].commandList[0]);
  expect(vars000.length).toBe(1);
  expect(vars000).toContain("__ans");

  done();
});

it("fetch variables from miniTask `(a) -> (x) => x+1 -> a`", (done) => {
  const miniTask = new SingleTask("(a) -> (x) => x+1 -> a");
  const miniVars = getVariables(miniTask);
  expect(miniVars.length).toBe(0);
  done();
});

it("render template correctly", (done) => {
  const template = "function <%= functionName %> (<%= inputs.join(', ') %>){\n" +
    "  vars <%= vars.join(', ') %>;\n" +
    "  return true;\n" +
    "}";
  const config = {functionName: "fn", inputs: ["n1", "n2"], vars: ["a", "b", "c"]};

  const expect1 = "function fn (n1, n2){\n" +
    "  vars a, b, c;\n" +
    "  return true;\n" +
    "}";
  const result1 = renderTemplate(template, config);
  expect(result1).toBe(expect1);

  const expect2 = "  function fn (n1, n2){\n" +
    "    vars a, b, c;\n" +
    "    return true;\n" +
    "  }";
  const result2 = renderTemplate(template, config, 2);
  expect(result2).toBe(expect2);

  done();
});

function createScriptAndHandler(config): Promise<any> {
  const script = createHandlerScript(new SingleTask(config));
  const sandbox = {cmdComposedCommand, __main_0: null};
  runInNewContext(script, sandbox);
  const handler = sandbox.__main_0;
  return Promise.resolve({script, handler});
}

it("cmd handler works `(a, b) -> node add.js`", (done) => {
  const testProgramPath = resolve(__dirname, "cmd.test.add.js");
  const config = `(a, b) -> node ${testProgramPath}`;
  createScriptAndHandler(config).then(({script, handler}) => {
    console.log(script);
    handler(4, 5).then((result) => {
      expect(result).toBe("9\n");
      done();
    });
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("jsAsync handler works `(a,b) -> [(x, y, callback) => callback(null, x + y)]`", (done) => {
  const config = "(a,b) -> [(x, y, callback) => callback(null, x + y)]";
  createScriptAndHandler(config).then(({script, handler}) => {
    console.log(script);
    handler(4, 5).then((result) => {
      expect(result).toBe(9);
      done();
    });
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("jsSync handler works `(a,b) -> (x, y) => x + y`", (done) => {
  const config = "(a,b) -> (x, y) => x + y";
  createScriptAndHandler(config).then(({script, handler}) => {
    console.log(script);
    handler(4, 5).then((result) => {
      expect(result).toBe(9);
      done();
    });
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("jsPromise handler works `(a,b) -> <Promise.resolve(a + b)>`", (done) => {
  const config = "(a,b) -> <Promise.resolve(a + b)>";
  createScriptAndHandler(config).then(({script, handler}) => {
    console.log(script);
    handler(4, 5).then((result) => {
      expect(result).toBe(9);
      done();
    });
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("series handler works", (done) => {
  const config = {
    do: [
      "(a) -> (x) => x + 1 -> b",
      "(b) -> (x) => x * 2",
    ],
    ins: "a",
  };
  createScriptAndHandler(config).then(({script, handler}) => {
    console.log(script);
    handler(4).then((result) => {
      expect(result).toBe(10);
      done();
    });
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("parallel handler works", (done) => {
  const config = {
    ins: "a",
    out: "b",
    parallel: [
      "(a) -> (x) => x + 1 -> b[0]",
      "(a) -> (x) => x * 2 -> b[1]",
    ],
    vars: {b: []},
  };
  createScriptAndHandler(config).then(({script, handler}) => {
    console.log(script);
    handler(4).then((result) => {
      expect(result[0]).toBe(5);
      expect(result[1]).toBe(8);
      done();
    });
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("loop handler works", (done) => {
  const config = {
    do: "(a) -> (x) => x + 1 -> a",
    if: "a < 5",
    while: "a < 10",
  };
  createScriptAndHandler(config).then(({script, handler}) => {
    console.log(script);
    handler(4).then((result) => {
      expect(result).toBe(10);
    }).then(() => {
      return handler(6);
    }).then((result) => {
      expect(result).toBe(6);
    }).then(() => {
      return handler(11);
    }).then((result) => {
      expect(result).toBe(11);
      done();
    }).catch((error) => {
      expect(error).toBeNull();
      done();
    });
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});
