"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const singleTaskProperty_1 = require("../enums/singleTaskProperty");
const SingleTask_1 = require("./SingleTask");
it("constructor works with complete config object", (done) => {
    const config = {
        do: "{(x,y) => x+y}", if: "a > b", ins: ["a", "b"],
        out: "b", vars: { foo: "bar" }, while: "b < 2 * a",
    };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x,y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("a > b");
    expect(task.loopCondition).toBe("b < 2 * a");
    task.execute(5, 4)
        .then((result) => {
        expect(result).toBe(14);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with object that has empty `do`", (done) => {
    const config = { do: "" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute()
        .then((result) => {
        expect(result).toBeUndefined();
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with empty object", (done) => {
    const config = {};
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute()
        .then((result) => {
        expect(result).toBeUndefined();
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config object where ins is string and command is unflanked arrow function", (done) => {
    const config = { ins: "a, b", do: "(x,y) => x+y", out: "c" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x,y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config object where command is unflanked anonymous function", (done) => {
    const config = { ins: "a, b", do: "function (x,y) {return x+y;}", out: "c" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("function (x,y) {return x+y;}");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("SingleTask.execute reject in case of invalid syntax", (done) => {
    // missing closing brace, should be syntax error
    const config = { ins: "a, b", do: "[function (x,y, callback) {callback(null, x+y)]", out: "c" };
    const task = new SingleTask_1.SingleTask(config);
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBeNull();
        done();
    })
        .catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
it("constructor works with config object where command is flanked with square bracket", (done) => {
    const config = { ins: "a, b", do: "[function (x,y, callback) {callback(null, x+y)}]", out: "c" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("function (x,y, callback) {callback(null, x+y)}");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsAsyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config object where command is flanked with chevron", (done) => {
    const config = { ins: "", do: "<Promise.resolve(73)>", out: "c" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("c");
    expect(task.command).toBe("Promise.resolve(73)");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsPromise);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute()
        .then((result) => {
        expect(result).toBe(73);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config object where command is cmd", (done) => {
    const config = { ins: "a", do: "echo", out: "b" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("echo");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.cmd);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(15)
        .then((result) => {
        expect(result).toBe(15);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with empty config object", (done) => {
    const config = {};
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(15)
        .then((result) => {
        expect(result).toBeUndefined();
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `(a, b) -> (x, y) => x+y -> c`", (done) => {
    const config = "(a, b) -> (x, y) => x+y -> c";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `c <- (x, y) => x+y <- (a, b)`", (done) => {
    const config = "c <- (x, y) => x+y <- (a, b)";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `(a, b) -> (x, y) => x+y`", (done) => {
    const config = "(a, b) -> (x, y) => x+y";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `(x, y) => x+y <- (a, b)`", (done) => {
    const config = "(x, y) => x+y <- (a, b)";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `() => 73 -> a`", (done) => {
    const config = "() => 73 -> a";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute()
        .then((result) => {
        expect(result).toBe(73);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `a <- () => 73`", (done) => {
    const config = "a <- () => 73";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute()
        .then((result) => {
        expect(result).toBe(73);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `a --> b`", (done) => {
    const config = "a --> b";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4)
        .then((result) => {
        expect(result).toBe(4);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `b <-- a`", (done) => {
    const config = "b <-- a";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4)
        .then((result) => {
        expect(result).toBe(4);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config string `echo abc`", (done) => {
    const config = "echo abc";
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("echo abc");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.cmd);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute()
        .then((result) => {
        expect(result).toBe("abc");
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `(a, b) -> (x, y) => x+y -> c`", (done) => {
    const config = { do: "(a, b) -> (x, y) => x+y -> c" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `c <- (x, y) => x+y <- (a, b)`", (done) => {
    const config = { do: "c <- (x, y) => x+y <- (a, b)" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("c");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `(a, b) -> (x, y) => x+y`", (done) => {
    const config = { do: "(a, b) -> (x, y) => x+y" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `(x, y) => x+y <- (a, b)`", (done) => {
    const config = { do: "(x, y) => x+y <- (a, b)" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("(x, y) => x+y");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(4, 5)
        .then((result) => {
        expect(result).toBe(9);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `() => 73 -> a`", (done) => {
    const config = { do: "() => 73 -> a" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(73)
        .then((result) => {
        expect(result).toBe(73);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `a <- () => 73`", (done) => {
    const config = { do: "a <- () => 73" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("a");
    expect(task.command).toBe("() => 73");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(73)
        .then((result) => {
        expect(result).toBe(73);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `a --> b`", (done) => {
    const config = { do: "a --> b" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(73)
        .then((result) => {
        expect(result).toBe(73);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `b <-- a`", (done) => {
    const config = { do: "b <-- a" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(1);
    expect(task.ins[0]).toBe("a");
    expect(task.out).toBe("b");
    expect(task.command).toBe("(x) => x");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(73)
        .then((result) => {
        expect(result).toBe(73);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with config.do = `echo abc`", (done) => {
    const config = { do: "echo abc" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(0);
    expect(task.out).toBe("__ans");
    expect(task.command).toBe("echo abc");
    expect(task.commandType).toBe(singleTaskProperty_1.CommandType.cmd);
    expect(task.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute()
        .then((result) => {
        expect(result).toBe("abc");
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with nested config object", (done) => {
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
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("e");
    expect(task.mode).toBe(singleTaskProperty_1.Mode.series);
    expect(task.commandList.length).toBe(2);
    expect(task.commandList[0].id).toBe("_0_0");
    expect(task.commandList[0].mode).toBe(singleTaskProperty_1.Mode.parallel);
    // (a, b) -> (x, y) => x + y -> c
    expect(task.commandList[0].commandList[0].id).toBe("_0_0_0");
    expect(task.commandList[0].commandList[0].mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.commandList[0].commandList[0].commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[0].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[0].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[0].ins.length).toBe(2);
    expect(task.commandList[0].commandList[0].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[0].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[0].out).toBe("c");
    expect(task.commandList[0].commandList[0].command).toBe("(x, y) => x + y");
    // (a, b) -> (x, y) => x - y -> d
    expect(task.commandList[0].commandList[1].id).toBe("_0_0_1");
    expect(task.commandList[0].commandList[1].mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.commandList[0].commandList[1].commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[1].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[1].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[1].ins.length).toBe(2);
    expect(task.commandList[0].commandList[1].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[1].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[1].out).toBe("d");
    expect(task.commandList[0].commandList[1].command).toBe("(x, y) => x - y");
    // (c, d) -> (x, y) => x * y -> e
    expect(task.commandList[1].id).toBe("_0_1");
    expect(task.commandList[1].mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.commandList[1].commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.commandList[1].branchCondition).toBe("true");
    expect(task.commandList[1].loopCondition).toBe("false");
    expect(task.commandList[1].ins.length).toBe(2);
    expect(task.commandList[1].ins[0]).toBe("c");
    expect(task.commandList[1].ins[1]).toBe("d");
    expect(task.commandList[1].out).toBe("e");
    expect(task.commandList[1].command).toBe("(x, y) => x * y");
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(10, 6)
        .then((result) => {
        expect(result).toBe(64);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor works with nested config object", (done) => {
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
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins.length).toBe(2);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.out).toBe("e");
    expect(task.mode).toBe(singleTaskProperty_1.Mode.series);
    expect(task.commandList.length).toBe(2);
    expect(task.commandList[0].id).toBe("_0_0");
    expect(task.commandList[0].mode).toBe(singleTaskProperty_1.Mode.parallel);
    // (a, b) -> (x, y) => x + y -> c
    expect(task.commandList[0].commandList[0].id).toBe("_0_0_0");
    expect(task.commandList[0].commandList[0].mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.commandList[0].commandList[0].commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[0].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[0].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[0].ins.length).toBe(2);
    expect(task.commandList[0].commandList[0].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[0].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[0].out).toBe("c");
    expect(task.commandList[0].commandList[0].command).toBe("(x, y) => x + y");
    // (a, b) -> (x, y) => x - y -> d
    expect(task.commandList[0].commandList[1].id).toBe("_0_0_1");
    expect(task.commandList[0].commandList[1].mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.commandList[0].commandList[1].commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.commandList[0].commandList[1].branchCondition).toBe("true");
    expect(task.commandList[0].commandList[1].loopCondition).toBe("false");
    expect(task.commandList[0].commandList[1].ins.length).toBe(2);
    expect(task.commandList[0].commandList[1].ins[0]).toBe("a");
    expect(task.commandList[0].commandList[1].ins[1]).toBe("b");
    expect(task.commandList[0].commandList[1].out).toBe("d");
    expect(task.commandList[0].commandList[1].command).toBe("(x, y) => x - y");
    // (c, d) -> (x, y) => x * y -> e
    expect(task.commandList[1].id).toBe("_0_1");
    expect(task.commandList[1].mode).toBe(singleTaskProperty_1.Mode.single);
    expect(task.commandList[1].commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(task.commandList[1].branchCondition).toBe("true");
    expect(task.commandList[1].loopCondition).toBe("false");
    expect(task.commandList[1].ins.length).toBe(2);
    expect(task.commandList[1].ins[0]).toBe("c");
    expect(task.commandList[1].ins[1]).toBe("d");
    expect(task.commandList[1].out).toBe("e");
    expect(task.commandList[1].command).toBe("(x, y) => x * y");
    expect(task.branchCondition).toBe("true");
    expect(task.loopCondition).toBe("false");
    task.execute(10, 6)
        .then((result) => {
        expect(result).toBe(64);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor recognize map", (done) => {
    const config = { map: "[1, 2, 3, 4, 5]", into: "square", do: "(x) => x * x" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("square");
    expect(task.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.map);
    expect(task.command).toBe("(x) => x * x");
    task.execute()
        .then((result) => {
        expect(result).toMatchObject([1, 4, 9, 16, 25]);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor recognize map (config.src is array, and config.into is null)", (done) => {
    const config = { map: [1, 2, 3, 4, 5], do: "(x) => x * x" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.src).toBe("[1,2,3,4,5]");
    expect(task.dst).toBe("__fx");
    expect(task.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.map);
    expect(task.command).toBe("(x) => x * x");
    task.execute()
        .then((result) => {
        expect(result).toMatchObject([1, 4, 9, 16, 25]);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor recognize filter", (done) => {
    const config = { filter: "[1, 2, 3, 4, 5]", into: "even", do: "(x) => x % 2 === 0" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("even");
    expect(task.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.filter);
    expect(task.command).toBe("(x) => x % 2 === 0");
    task.execute()
        .then((result) => {
        expect(result).toMatchObject([2, 4]);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor recognize reduce", (done) => {
    const config = { reduce: "[1, 2, 3, 4, 5]", into: "sum", do: "(x, y) => x + y" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.ins[1]).toBe("__acc");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("sum");
    expect(task.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.reduce);
    expect(task.command).toBe("(x, y) => x + y");
    expect(task.accumulator).toBe("0");
    task.execute()
        .then((result) => {
        expect(result).toBe(15);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("constructor recognize reduce (with accumulator)", (done) => {
    const config = { reduce: "[1, 2, 3, 4, 5]", into: "sum", accumulator: "1", do: "(x, y) => x + y" };
    const task = new SingleTask_1.SingleTask(config);
    expect(task.id).toBe("_0");
    expect(task.ins[0]).toBe("__el");
    expect(task.ins[1]).toBe("__acc");
    expect(task.src).toBe("[1, 2, 3, 4, 5]");
    expect(task.dst).toBe("sum");
    expect(task.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.reduce);
    expect(task.command).toBe("(x, y) => x + y");
    expect(task.accumulator).toBe("1");
    task.execute()
        .then((result) => {
        expect(result).toBe(16);
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
//# sourceMappingURL=SingleTask.test.js.map