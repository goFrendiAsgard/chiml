"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const singleTaskProperty_1 = require("../../enums/singleTaskProperty");
const singleTaskConfigProcessor_1 = require("../../libraries/singleTaskConfigProcessor");
test("normalizeRawConfig works with complete config object", () => {
    const rawConfig = {
        do: "{(x,y) => x+y}", if: "a < b", ins: ["a", "b"],
        out: "c", vars: { foo: "bar" }, while: "c < 2 * (a + b)",
    };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("(x,y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("a < b");
    expect(config.loopCondition).toBe("c < 2 * (a + b)");
});
test("normalizeRawConfig works with null object`", () => {
    const rawConfig = null;
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with object that has empty `do`", () => {
    const rawConfig = { do: "" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with empty object", () => {
    const rawConfig = {};
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config object where ins is string and command is unflanked arrow function", () => {
    const rawConfig = { ins: "a, b", do: "(x,y) => x+y", out: "c" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("(x,y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config object where command is unflanked anonymous function", () => {
    const rawConfig = { ins: "a, b", do: "function (x,y) {return x+y;}", out: "c" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("function (x,y) {return x+y;}");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config object where command is flanked with square bracket", () => {
    const rawConfig = { ins: "a, b", do: "[function (x,y, callback) {callback(x+y)]", out: "c" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("function (x,y, callback) {callback(x+y)");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsFunctionWithCallback);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config object where command is flanked with chevron", () => {
    const rawConfig = { ins: "", do: "<new Promise((resolve, reject) => {resolve(73);});>", out: "c" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("c");
    expect(config.command).toBe("new Promise((resolve, reject) => {resolve(73);});");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsPromise);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config object where command is cmd", () => {
    const rawConfig = { ins: "a", do: "cowsay", out: "b" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(1);
    expect(config.ins[0]).toBe("a");
    expect(config.out).toBe("b");
    expect(config.command).toBe("cowsay");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.cmd);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with empty config object", () => {
    const rawConfig = {};
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `(a, b) -> (x, y) => x+y -> c`", () => {
    const rawConfig = "(a, b) -> (x, y) => x+y -> c";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `c <- (x, y) => x+y <- (a, b)`", () => {
    const rawConfig = "c <- (x, y) => x+y <- (a, b)";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `(a, b) -> (x, y) => x+y`", () => {
    const rawConfig = "(a, b) -> (x, y) => x+y";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `(x, y) => x+y <- (a, b)`", () => {
    const rawConfig = "(x, y) => x+y <- (a, b)";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `() => 73 -> a`", () => {
    const rawConfig = "() => 73 -> a";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("a");
    expect(config.command).toBe("() => 73");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `a <- () => 73`", () => {
    const rawConfig = "a <- () => 73";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("a");
    expect(config.command).toBe("() => 73");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `a --> b`", () => {
    const rawConfig = "a --> b";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(1);
    expect(config.ins[0]).toBe("a");
    expect(config.out).toBe("b");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `b <-- a`", () => {
    const rawConfig = "b <-- a";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(1);
    expect(config.ins[0]).toBe("a");
    expect(config.out).toBe("b");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("strToNormalizedConfig works with config string `ls`", () => {
    const rawConfig = "ls";
    const config = singleTaskConfigProcessor_1.strToNormalizedConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("ls");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.cmd);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `(a, b) -> (x, y) => x+y -> c`", () => {
    const rawConfig = { do: "(a, b) -> (x, y) => x+y -> c" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `c <- (x, y) => x+y <- (a, b)`", () => {
    const rawConfig = { do: "c <- (x, y) => x+y <- (a, b)" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("c");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `(a, b) -> (x, y) => x+y`", () => {
    const rawConfig = { do: "(a, b) -> (x, y) => x+y" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `(x, y) => x+y <- (a, b)`", () => {
    const rawConfig = { do: "(x, y) => x+y <- (a, b)" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("(x, y) => x+y");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `() => 73 -> a`", () => {
    const rawConfig = { do: "() => 73 -> a" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("a");
    expect(config.command).toBe("() => 73");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `a <- () => 73`", () => {
    const rawConfig = { do: "a <- () => 73" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("a");
    expect(config.command).toBe("() => 73");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `a --> b`", () => {
    const rawConfig = { do: "a --> b" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(1);
    expect(config.ins[0]).toBe("a");
    expect(config.out).toBe("b");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `b <-- a`", () => {
    const rawConfig = { do: "b <-- a" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(1);
    expect(config.ins[0]).toBe("a");
    expect(config.out).toBe("b");
    expect(config.command).toBe("(x) => x");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.jsSyncFunction);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with config.do = `ls`", () => {
    const rawConfig = { do: "ls" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(0);
    expect(config.out).toBe("__ans");
    expect(config.command).toBe("ls");
    expect(config.commandType).toBe(singleTaskProperty_1.CommandType.cmd);
    expect(config.mode).toBe(singleTaskProperty_1.Mode.single);
    expect(config.branchCondition).toBe("true");
    expect(config.loopCondition).toBe("false");
});
test("normalizeRawConfig works with nested config object", () => {
    const rawConfig = {
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
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("e");
    expect(config.mode).toBe(singleTaskProperty_1.Mode.series);
    expect(config.commandList.length).toBe(2);
});
test("normalizeRawConfig works with nested config object", () => {
    const rawConfig = {
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
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.ins.length).toBe(2);
    expect(config.ins[0]).toBe("a");
    expect(config.ins[1]).toBe("b");
    expect(config.out).toBe("e");
    expect(config.mode).toBe(singleTaskProperty_1.Mode.series);
    expect(config.commandList.length).toBe(2);
});
test("normalizeRawConfig recognize map", () => {
    const rawConfig = { map: "[1, 2, 3, 4, 5]", into: "square", do: "(x) => x * x" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.src).toBe("[1, 2, 3, 4, 5]");
    expect(config.dst).toBe("square");
    expect(config.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.map);
    expect(config.command).toBe("(x) => x * x");
});
test("normalizeRawConfig recognize map (config.src is array, and config.into is null)", () => {
    const rawConfig = { map: [1, 2, 3, 4, 5], do: "(x) => x * x" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.src).toBe("[1,2,3,4,5]");
    expect(config.dst).toBe("__fx");
    expect(config.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.map);
    expect(config.command).toBe("(x) => x * x");
});
test("normalizeRawConfig recognize filter", () => {
    const rawConfig = { filter: "[1, 2, 3, 4, 5]", into: "even", do: "(x) => x % 2" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.src).toBe("[1, 2, 3, 4, 5]");
    expect(config.dst).toBe("even");
    expect(config.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.filter);
    expect(config.command).toBe("(x) => x % 2");
});
test("normalizeRawConfig recognize reduce", () => {
    const rawConfig = { reduce: "[1, 2, 3, 4, 5]", into: "sum", do: "(x, y) => x + y" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.src).toBe("[1, 2, 3, 4, 5]");
    expect(config.dst).toBe("sum");
    expect(config.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.reduce);
    expect(config.command).toBe("(x, y) => x + y");
    expect(config.accumulator).toBe("0");
});
test("normalizeRawConfig recognize reduce (with accumulator)", () => {
    const rawConfig = { reduce: "[1, 2, 3, 4, 5]", into: "sum", accumulator: "1", do: "(x, y) => x + y" };
    const config = singleTaskConfigProcessor_1.normalizeRawConfig(rawConfig);
    expect(config.src).toBe("[1, 2, 3, 4, 5]");
    expect(config.dst).toBe("sum");
    expect(config.functionalMode).toBe(singleTaskProperty_1.FunctionalMode.reduce);
    expect(config.command).toBe("(x, y) => x + y");
    expect(config.accumulator).toBe("1");
});
