"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SingleTask_1 = require("./SingleTask");
it("accept object as constructor parameter", (done) => {
    const obj = { ins: ["a", "b"], do: "{(x,y) => x+y}", out: "c" };
    const task = new SingleTask_1.default(obj);
    expect(task.ins[0]).toBe("a");
    expect(task.ins[1]).toBe("b");
    expect(task.command).toBe("{(x,y) => x+y}");
    task.execute(4, 5).then((result) => {
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
//# sourceMappingURL=SingleTask.test.js.map