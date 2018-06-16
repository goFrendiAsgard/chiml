"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const cmd_1 = require("./cmd");
it("should able to run `node -e \"console.log('hello');\"`", (done) => {
    cmd_1.cmd("node -e \"console.log('hello');\"").then((stdout) => {
        expect(stdout).toBe("hello\n");
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
it("should yield error when run `sendNukeToKrypton`", (done) => {
    cmd_1.cmd("sendNukeToKrypton").then((stdout) => {
        expect(stdout).toBeNull();
        done();
    }).catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
it("should able to run `node` interactively", (done) => {
    const scriptPath = (path_1.resolve(__dirname, "cmd.test.add.js"));
    cmd_1.cmd(`printf '2\n3\n' | node ${scriptPath}`).then((stdout) => {
        expect(stdout).toBe("5\n");
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
//# sourceMappingURL=cmd.test.js.map