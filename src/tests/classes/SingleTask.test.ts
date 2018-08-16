import { SingleTask } from "../../classes/SingleTask";
import { CommandType, FunctionalMode, Mode } from "../../enums/singleTaskProperty";

test("constructor works with complete config object", () => {
    const config = {
        do: "{(x,y) => x+y}", if: "a > b", ins: ["a", "b"],
        out: "b", vars: { foo: "bar" }, while: "b < 2 * a",
    };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x,y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("a > b");
    expect(task.loopCondition).toBe("b < 2 * a");
    return task.execute(5, 4)
        .then((result) => {
            expect(result).toBe(14);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with object that has empty `do`", () => {
    const config = { do: "" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute()
        .then((result) => {
            expect(result).toBeUndefined();
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with empty object", () => {
    const config = {};
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute()
        .then((result) => {
            expect(result).toBeUndefined();
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config object where ins is string and command is unflanked arrow function", () => {
    const config = { ins: "a, b", do: "(x,y) => x+y", out: "c" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x,y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config object where command is unflanked anonymous function", () => {
    const config = { ins: "a, b", do: "function (x,y) {return x+y;}", out: "c" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("function (x,y) {return x+y;}");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("SingleTask.execute reject in case of invalid syntax", () => {
    // missing closing brace, should be syntax error
    const config = { ins: "a, b", do: "[function (x,y, callback) {callback(null, x+y)]", out: "c" };
    const task = new SingleTask(config);
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBeNull();
        })
        .catch((error) => {
            expect(error).toBeDefined();
        });
});

test("constructor works with config object where command is flanked with square bracket", () => {
    const config = { ins: "a, b", do: "[function (x,y, callback) {callback(null, x+y)}]", out: "c" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("function (x,y, callback) {callback(null, x+y)}");
    expect(task.commandType).toBe(CommandType.jsFunctionWithCallback);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config object where command is flanked with chevron", () => {
    const config = { ins: "", do: "<Promise.resolve(73)>", out: "c" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("c");
    expect(task.command).toBe("Promise.resolve(73)");
    expect(task.commandType).toBe(CommandType.jsPromise);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute()
        .then((result) => {
            expect(result).toBe(73);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config object where command is cmd", () => {
    const config = { ins: "a", do: "echo", out: "b" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("echo");
    expect(task.commandType).toBe(CommandType.cmd);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(15)
        .then((result) => {
            expect(result).toBe(15);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with empty config object", () => {
    const config = {};
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(15)
        .then((result) => {
            expect(result).toBeUndefined();
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `(a, b) -> (x, y) => x+y -> c`", () => {
    const config = "(a, b) -> (x, y) => x+y -> c";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `c <- (x, y) => x+y <- (a, b)`", () => {
    const config = "c <- (x, y) => x+y <- (a, b)";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `(a, b) -> (x, y) => x+y`", () => {
    const config = "(a, b) -> (x, y) => x+y";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `(x, y) => x+y <- (a, b)`", () => {
    const config = "(x, y) => x+y <- (a, b)";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `() => 73 -> a`", () => {
    const config = "() => 73 -> a";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute()
        .then((result) => {
            expect(result).toBe(73);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `a <- () => 73`", () => {
    const config = "a <- () => 73";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute()
        .then((result) => {
            expect(result).toBe(73);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `a --> b`", () => {
    const config = "a --> b";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4)
        .then((result) => {
            expect(result).toBe(4);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `b <-- a`", () => {
    const config = "b <-- a";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4)
        .then((result) => {
            expect(result).toBe(4);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config string `echo abc`", () => {
    const config = "echo abc";
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("echo abc");
    expect(task.commandType).toBe(CommandType.cmd);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute()
        .then((result) => {
            expect(result).toBe("abc");
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `(a, b) -> (x, y) => x+y -> c`", () => {
    const config = { do: "(a, b) -> (x, y) => x+y -> c" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `c <- (x, y) => x+y <- (a, b)`", () => {
    const config = { do: "c <- (x, y) => x+y <- (a, b)" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `(a, b) -> (x, y) => x+y`", () => {
    const config = { do: "(a, b) -> (x, y) => x+y" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `(x, y) => x+y <- (a, b)`", () => {
    const config = { do: "(x, y) => x+y <- (a, b)" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(4, 5)
        .then((result) => {
            expect(result).toBe(9);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `() => 73 -> a`", () => {
    const config = { do: "() => 73 -> a" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(73)
        .then((result) => {
            expect(result).toBe(73);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `a <- () => 73`", () => {
    const config = { do: "a <- () => 73" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(73)
        .then((result) => {
            expect(result).toBe(73);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `a --> b`", () => {
    const config = { do: "a --> b" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(73)
        .then((result) => {
            expect(result).toBe(73);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `b <-- a`", () => {
    const config = { do: "b <-- a" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(CommandType.jsSyncFunction);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(73)
        .then((result) => {
            expect(result).toBe(73);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with config.do = `echo abc`", () => {
    const config = { do: "echo abc" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("echo abc");
    expect(task.commandType).toBe(CommandType.cmd);
    expect(task.mode).toBe(Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute()
        .then((result) => {
            expect(result).toBe("abc");
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with nested config object", () => {
    const config = {
        do: [
            {
                parallel: [
                    "(a, b) -> (x, y) => x + y -> c",
                    "(a, b) -> (x, y) => x - y -> d",
                ],
            },
            "(c, d) -> (x, y) => x * y -> e",
        ],
        ins: "a, b",
        out: "e",
    };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("e");
    expect(task.mode).toBe(Mode.series);
    expect(task.commandList.length).toBe(2);
    expect(task.commandList[0].id).toBe("_0_0");
    expect(task.commandList[0].mode).toBe(Mode.parallel);
    // (a, b) -> (x, y) => x + y -> c
    expect(task.commandList[0].commandList[0].id).toBe("_0_0_0");
    expect(task.commandList[0].commandList[0].mode).toBe(Mode.single);
    expect(task.commandList[0].commandList[0].commandType).toBe(CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[0].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[0].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[0].ins.length).toBe(2);
    expect(task.commandList[0].commandList[0].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[0].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[0].out).toBe("c");
    expect(task.commandList[0].commandList[0].command).toBe("(x, y) => x + y");
    // (a, b) -> (x, y) => x - y -> d
    expect(task.commandList[0].commandList[1].id).toBe("_0_0_1");
    expect(task.commandList[0].commandList[1].mode).toBe(Mode.single);
    expect(task.commandList[0].commandList[1].commandType).toBe(CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[1].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[1].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[1].ins.length).toBe(2);
    expect(task.commandList[0].commandList[1].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[1].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[1].out).toBe("d");
    expect(task.commandList[0].commandList[1].command).toBe("(x, y) => x - y");
    // (c, d) -> (x, y) => x * y -> e
    expect(task.commandList[1].id).toBe("_0_1");
    expect(task.commandList[1].mode).toBe(Mode.single);
    expect(task.commandList[1].commandType).toBe(CommandType.jsSyncFunction);
    expect(task.commandList[1].branchCondition).toBe("true");
    expect(task.commandList[1].loopCondition).toBe("false");
    expect(task.commandList[1].ins.length).toBe(2);
    expect(task.commandList[1].ins[0]).toBe("c");
    expect(task.commandList[1].ins[1]).toBe("d");
    expect(task.commandList[1].out).toBe("e");
    expect(task.commandList[1].command).toBe("(x, y) => x * y");
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(10, 6)
        .then((result) => {
            expect(result).toBe(64);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor works with nested config object", () => {
    const config = {
        ins: "a, b",
        out: "e",
        series: [
            {
                parallel: [
                    "(a, b) -> (x, y) => x + y -> c",
                    "(a, b) -> (x, y) => x - y -> d",
                ],
            },
            "(c, d) -> (x, y) => x * y -> e",
        ],
    };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("e");
    expect(task.mode).toBe(Mode.series);
    expect(task.commandList.length).toBe(2);
    expect(task.commandList[0].id).toBe("_0_0");
    expect(task.commandList[0].mode).toBe(Mode.parallel);
    // (a, b) -> (x, y) => x + y -> c
    expect(task.commandList[0].commandList[0].id).toBe("_0_0_0");
    expect(task.commandList[0].commandList[0].mode).toBe(Mode.single);
    expect(task.commandList[0].commandList[0].commandType).toBe(CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[0].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[0].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[0].ins.length).toBe(2);
    expect(task.commandList[0].commandList[0].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[0].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[0].out).toBe("c");
    expect(task.commandList[0].commandList[0].command).toBe("(x, y) => x + y");
    // (a, b) -> (x, y) => x - y -> d
    expect(task.commandList[0].commandList[1].id).toBe("_0_0_1");
    expect(task.commandList[0].commandList[1].mode).toBe(Mode.single);
    expect(task.commandList[0].commandList[1].commandType).toBe(CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[1].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[1].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[1].ins.length).toBe(2);
    expect(task.commandList[0].commandList[1].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[1].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[1].out).toBe("d");
    expect(task.commandList[0].commandList[1].command).toBe("(x, y) => x - y");
    // (c, d) -> (x, y) => x * y -> e
    expect(task.commandList[1].id).toBe("_0_1");
    expect(task.commandList[1].mode).toBe(Mode.single);
    expect(task.commandList[1].commandType).toBe(CommandType.jsSyncFunction);
    expect(task.commandList[1].branchCondition).toBe("true");
    expect(task.commandList[1].loopCondition).toBe("false");
    expect(task.commandList[1].ins.length).toBe(2);
    expect(task.commandList[1].ins[0]).toBe("c");
    expect(task.commandList[1].ins[1]).toBe("d");
    expect(task.commandList[1].out).toBe("e");
    expect(task.commandList[1].command).toBe("(x, y) => x * y");
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    return task.execute(10, 6)
        .then((result) => {
            expect(result).toBe(64);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor recognize map", () => {
    const config = { map: "[1, 2, 3, 4, 5]", into: "square", do: "(x) => x * x" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("square");
    expect(task.functionalMode).toBe(FunctionalMode.map);
    expect(task.command).toBe("(x) => x * x");
    return task.execute()
        .then((result) => {
            expect(result).toMatchObject([1, 4, 9, 16, 25]);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor recognize map (config.src is array, and config.into is null)", () => {
    const config = { map: [1, 2, 3, 4, 5], do: "(x) => x * x" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.src).toBe("[1,2,3,4,5]");
    expect(task.dst).toBe("__fx");
    expect(task.functionalMode).toBe(FunctionalMode.map);
    expect(task.command).toBe("(x) => x * x");
    return task.execute()
        .then((result) => {
            expect(result).toMatchObject([1, 4, 9, 16, 25]);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor recognize filter", () => {
    const config = { filter: "[1, 2, 3, 4, 5]", into: "even", do: "(x) => x % 2 === 0" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("even");
    expect(task.functionalMode).toBe(FunctionalMode.filter);
    expect(task.command).toBe("(x) => x % 2 === 0");
    return task.execute()
        .then((result) => {
            expect(result).toMatchObject([2, 4]);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor recognize reduce", () => {
    const config = { reduce: "[1, 2, 3, 4, 5]", into: "sum", do: "(x, y) => x + y" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.ins[1]).toBe("__acc");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("sum");
    expect(task.functionalMode).toBe(FunctionalMode.reduce);
    expect(task.command).toBe("(x, y) => x + y");
    expect(task.accumulator).toBe("0");
    return task.execute()
        .then((result) => {
            expect(result).toBe(15);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("constructor recognize reduce (with accumulator)", () => {
    const config = { reduce: "[1, 2, 3, 4, 5]", into: "sum", accumulator: "1", do: "(x, y) => x + y" };
    const task = new SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.ins[1]).toBe("__acc");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("sum");
    expect(task.functionalMode).toBe(FunctionalMode.reduce);
    expect(task.command).toBe("(x, y) => x + y");
    expect(task.accumulator).toBe("1");
    return task.execute()
        .then((result) => {
            expect(result).toBe(16);
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});
