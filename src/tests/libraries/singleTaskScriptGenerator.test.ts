import { dirname as pathDirName, resolve as pathResolve } from "path";
import { runInNewContext } from "vm";
import { SingleTask } from "../../classes/SingleTask";
import { createSandbox } from "../../libraries/sandbox";
import { createHandlerScript, renderTemplate } from "../../libraries/singleTaskScriptGenerator";

test("render template correctly", () => {
    const template = "function <%= functionName %> (<%= inputs.join(', ') %>){\n" +
        "  vars <%= vars.join(', ') %>;\n" +
        "  return true;\n" +
        "}";
    const config = { functionName: "fn", inputs: ["n1", "n2"], vars: ["a", "b", "c"] };

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
});

function createScriptAndHandler(config: any): Promise<any> {
    const script = createHandlerScript(new SingleTask(config));
    const sandbox: { [key: string]: any } = createSandbox(config);
    runInNewContext(script, sandbox);
    const handler = sandbox.__main_0;
    return Promise.resolve({ script, handler });
}

test("cmd handler works `(a, b) -> node add.js`", () => {
    const rootDirPath = pathDirName(pathDirName(pathDirName(__dirname)));
    const testProgramPath = pathResolve(rootDirPath, "testcase", "cmd", "add.js");
    const config = `(a, b) -> node ${testProgramPath}`;
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler(4, 5)
                .then((result) => {
                    expect(result).toBe(9);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("jsAsync handler works `(a,b) -> [(x, y, callback) => callback(null, x + y)]`", () => {
    const config = "(a,b) -> [(x, y, callback) => callback(null, x + y)]";
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler(4, 5)
                .then((result) => {
                    expect(result).toBe(9);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("jsAsync handler works `() -> [(callback) => callback(null, 5)]`", () => {
    const config = "() -> [(callback) => callback(null, 5)]";
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler()
                .then((result) => {
                    expect(result).toBe(5);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("jsAsync handler works `() -> [(callback) => callback(null, 1, 2)]`", () => {
    const config = "() -> [(callback) => callback(null, 1, 2)]";
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler()
                .then((result) => {
                    expect(result).toHaveLength(2);
                    expect(result[0]).toBe(1);
                    expect(result[1]).toBe(2);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("jsSync handler works `(a,b) -> (x, y) => x + y`", () => {
    const config = "(a,b) -> (x, y) => x + y";
    createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler(4, 5)
                .then((result) => {
                    expect(result).toBe(9);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("jsPromise handler works `(a,b) -> <Promise.resolve(a + b)>`", () => {
    const config = "(a,b) -> <Promise.resolve(a + b)>";
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler(4, 5)
                .then((result) => {
                    expect(result).toBe(9);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("loop handler works", () => {
    const config = {
        do: "(a) -> (x) => x + 1 -> a",
        if: "a < 5",
        while: "a < 10",
    };
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            const promises = [handler(4), handler(8), handler(12)];
            Promise.all(promises)
                .then((results) => {
                    expect(results[0]).toBe(10);
                    expect(results[1]).toBe(8);
                    expect(results[2]).toBe(12);
                })
                .catch((error) => {
                    expect(error).toBeNull();
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("series handler works", () => {
    const config = {
        do: [
            "(a) -> (x) => x + 1 -> b",
            "(b) -> (x) => x * 2",
        ],
        ins: "a",
    };
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler(4)
                .then((result) => {
                    expect(result).toBe(10);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("parallel handler works", () => {
    const config = {
        ins: "a",
        out: "b",
        parallel: [
            "(a) -> (x) => x + 1 -> b[0]",
            "(a) -> (x) => x * 2 -> b[1]",
        ],
        vars: { b: [] },
    };
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler(4)
                .then((result) => {
                    expect(result[0]).toBe(5);
                    expect(result[1]).toBe(8);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("map handler works", () => {
    const config = {
        do: "(n) -> (x) => x * x",
        into: "y",
        map: "x",
    };
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler([1, 2, 3, 4])
                .then((result) => {
                    expect(result.length).toBe(4);
                    expect(result[0]).toBe(1);
                    expect(result[1]).toBe(4);
                    expect(result[2]).toBe(9);
                    expect(result[3]).toBe(16);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("filter handler works", () => {
    const config = {
        do: "(n) -> (x) => x % 2 === 0",
        filter: "x",
        into: "y",
    };
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler([1, 2, 3, 4])
                .then((result) => {
                    expect(result.length).toBe(2);
                    expect(result[0]).toBe(2);
                    expect(result[1]).toBe(4);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("reduce handler works", () => {
    const config = {
        do: "(n, total) -> (x, acc) => x + acc",
        into: "y",
        reduce: "x",
    };
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler([1, 2, 3, 4])
                .then((result) => {
                    expect(result).toBe(10);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("complex handler works", () => {
    const config = {
        do: [
            {
                parallel: [
                    {
                        do: "(n) -> (x) => x*x",
                        into: "squares",
                        map: "input",
                    },
                    {
                        do: "(n) -> (x) => x % 2 === 0",
                        filter: "input",
                        into: "even",
                    },
                    {
                        do: "(n, total) -> (x, acc) => x + acc",
                        into: "sum",
                        reduce: "input",
                    },
                    {
                        do: [
                            "n <-- 0",
                            {
                                do: "(n+1) --> n",
                                if: "n < 73",
                                while: "n < 73",
                            },
                        ],
                    },
                ],
            },
            "{even, squares, sum, n} --> output",
        ],
        ins: "input",
        out: "output",
    };
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            handler([1, 2, 3, 4])
                .then((result) => {
                    const keys = Object.keys(result);
                    expect(keys.length).toBe(4);
                    expect(keys).toContain("even");
                    expect(keys).toContain("squares");
                    expect(keys).toContain("sum");
                    expect(keys).toContain("n");
                    expect(result.even.length).toBe(2);
                    expect(result.even).toMatchObject([2, 4]);
                    expect(result.squares.length).toBe(4);
                    expect(result.squares).toMatchObject([1, 4, 9, 16]);
                    expect(result.sum).toBe(10);
                    expect(result.n).toBe(73);
                });
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("default variable works", () => {
    const config = {
        do: "(a) -> (x) => x + 1",
        ins: ["a"],
        vars: { a: 1 },
    };
    let programHandler = null;
    return createScriptAndHandler(config)
        .then(({ script, handler }) => {
            programHandler = handler;
        })
        .then(() => {
            return programHandler(5);
        })
        .then((result) => {
            expect(result).toBe(6);
        })
        .then(() => {
            return programHandler();
        })
        .then((result) => {
            expect(result).toBe(2);
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeUndefined();
        });
});
