import SingleTask from "./SingleTask";
import {CommandType, Mode} from "./SingleTask";

it("constructor works with complete config object", (done) => {
  const config = {do: "{(x,y) => x+y}", if: "a < b", ins: ["a", "b"],
    out: "c", vars: {foo: "bar"}, while: "c < 2 * (a + b)"};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("c");
  expect(task.command).toBe("(x,y) => x+y");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("a < b");
  expect(task.loopCondition).toBe("c < 2 * (a + b)");
  done();
});

it("constructor works with object that has empty `do`", (done) => {
  const config = {do: ""};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(0);
  expect(task.out).toBe("__ans");
  expect(task.command).toBe("(x) => x");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with empty object", (done) => {
  const config = {};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(0);
  expect(task.out).toBe("__ans");
  expect(task.command).toBe("(x) => x");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config object where ins is string and command is unflanked arrow function", (done) => {
  const config = {ins: "a, b", do: "(x,y) => x+y", out: "c"};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("c");
  expect(task.command).toBe("(x,y) => x+y");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config object where command is unflanked anonymous function", (done) => {
  const config = {ins: "a, b", do: "function (x,y) {return x+y;}", out: "c"};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("c");
  expect(task.command).toBe("function (x,y) {return x+y;}");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config object where command is flanked with square bracket", (done) => {
  const config = {ins: "a, b", do: "[function (x,y, callback) {callback(x+y)]", out: "c"};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("c");
  expect(task.command).toBe("function (x,y, callback) {callback(x+y)");
  expect(task.commandType).toBe(CommandType.jsAsyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config object where command is flanked with chevron", (done) => {
  const config = {ins: "", do: "<new Promise((resolve, reject) => {resolve(73);});>", out: "c"};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(0);
  expect(task.out).toBe("c");
  expect(task.command).toBe("new Promise((resolve, reject) => {resolve(73);});");
  expect(task.commandType).toBe(CommandType.jsPromise);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config object where command is cmd", (done) => {
  const config = {ins: "a", do: "cowsay", out: "b"};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(1);
  expect(task.ins[0]).toBe("a");
  expect(task.out).toBe("b");
  expect(task.command).toBe("cowsay");
  expect(task.commandType).toBe(CommandType.cmd);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with empty config object", (done) => {
  const config = {};
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(0);
  expect(task.out).toBe("__ans");
  expect(task.command).toBe("(x) => x");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `(a, b) -> (x, y) => x+y -> c`", (done) => {
  const config = "(a, b) -> (x, y) => x+y -> c";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("c");
  expect(task.command).toBe("(x, y) => x+y");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `c <- (x, y) => x+y <- (a, b)`", (done) => {
  const config = "c <- (x, y) => x+y <- (a, b)";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("c");
  expect(task.command).toBe("(x, y) => x+y");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `(a, b) -> (x, y) => x+y`", (done) => {
  const config = "(a, b) -> (x, y) => x+y";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("__ans");
  expect(task.command).toBe("(x, y) => x+y");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `(x, y) => x+y <- (a, b)`", (done) => {
  const config = "(x, y) => x+y <- (a, b)";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(2);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.out).toBe("__ans");
  expect(task.command).toBe("(x, y) => x+y");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `() => 73 -> a`", (done) => {
  const config = "() => 73 -> a";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(0);
  expect(task.out).toBe("a");
  expect(task.command).toBe("() => 73");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `a <- () => 73`", (done) => {
  const config = "a <- () => 73";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(0);
  expect(task.out).toBe("a");
  expect(task.command).toBe("() => 73");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `a --> b`", (done) => {
  const config = "a --> b";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(1);
  expect(task.ins[0]).toBe("a");
  expect(task.out).toBe("b");
  expect(task.command).toBe("(x) => x");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `b <-- a`", (done) => {
  const config = "b <-- a";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(1);
  expect(task.ins[0]).toBe("a");
  expect(task.out).toBe("b");
  expect(task.command).toBe("(x) => x");
  expect(task.commandType).toBe(CommandType.jsSyncFunction);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});

it("constructor works with config string `ls`", (done) => {
  const config = "ls";
  const task = new SingleTask(config);
  expect(task.ins.length).toBe(0);
  expect(task.out).toBe("__ans");
  expect(task.command).toBe("ls");
  expect(task.commandType).toBe(CommandType.cmd);
  expect(task.mode).toBe(Mode.single);
  expect(task.branchCondition).toBe("true");
  expect(task.loopCondition).toBe("false");
  done();
});
