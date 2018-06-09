import SingleTask from "./SingleTask";

it("accept object as constructor parameter", (done) => {
  const obj = {ins: ["a", "b"], do: "{(x,y) => x+y}", out: "c"};
  const task = new SingleTask(obj);
  expect(task.ins[0]).toBe("a");
  expect(task.ins[1]).toBe("b");
  expect(task.command).toBe("{(x,y) => x+y}");
  task.execute(4, 5).then((result: number) => {
    expect(result).toBe(9);
    done();
  }).catch(() => {
    done();
  });
});

it("accept string as constructor parameter", (done) => {
  done();
});

it("render subTask", (done) => {
  done();
});
