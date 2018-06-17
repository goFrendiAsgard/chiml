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
it("should yield error when run `sendNukeToKrypton` (assuming that command is not exists)", (done) => {
    cmd_1.cmd("sendNukeToKrypton").then((stdout) => {
        expect(stdout).toBeNull();
        done();
    }).catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
it("should able to run `node add.js` with input redirection", (done) => {
    const scriptPath = (path_1.resolve(__dirname, "cmd.test.add.js"));
    cmd_1.cmd(`(echo "2" && echo "3") | node ${scriptPath}`).then((stdout) => {
        expect(stdout).toBe("5\n");
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
it("should able to compose command and run it", (done) => {
    const scriptPath = (path_1.resolve(__dirname, "cmd.test.add.js"));
    const command = `node ${scriptPath}`;
    const ins = [7, 4];
    const composedCommand = cmd_1.composeCommand(command, ins);
    expect(composedCommand).toBe(`(echo "7" && echo "4") | ${command} "7" "4"`);
    cmd_1.cmdComposedCommand(command, ins).then((stdout) => {
        expect(stdout).toBe("11\n");
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
//# sourceMappingURL=cmd.test.js.map