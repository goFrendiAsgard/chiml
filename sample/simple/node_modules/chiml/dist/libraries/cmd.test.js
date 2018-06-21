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
const rootDirPath = path_1.dirname(path_1.dirname(__dirname));
const testPath = path_1.resolve(rootDirPath, "testcase", "cmd");
const addJsPath = path_1.resolve(testPath, "add.js");
it("should able to run `node add.js` with input redirection", (done) => {
    cmd_1.cmd(`(echo "2" && echo "3") | node ${addJsPath}`).then((stdout) => {
        expect(stdout).toBe("5\n");
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
it("should able to compose command `node add.js` and run it", (done) => {
    const command = `node ${addJsPath}`;
    const ins = [7, 4];
    const composedCommand = cmd_1.composeCommand(command, ins);
    expect(composedCommand).toBe(`(echo "7" && echo "4") | ${command} "7" "4"`);
    cmd_1.cmdComposedCommand(command, ins).then((stdout) => {
        expect(stdout).toBe(11);
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
it("should able to compose command `echo` and run it", (done) => {
    const command = "echo";
    const ins = ["hello"];
    const composedCommand = cmd_1.composeCommand(command, ins);
    expect(composedCommand).toBe('(echo "hello") | echo "hello"');
    cmd_1.cmdComposedCommand(command, ins).then((stdout) => {
        expect(stdout).toBe("hello");
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
it("should able to compose command `echo abc` and run it", (done) => {
    const command = "echo abc";
    const ins = [];
    const composedCommand = cmd_1.composeCommand(command, ins);
    expect(composedCommand).toBe("echo abc");
    cmd_1.cmdComposedCommand(command, ins).then((stdout) => {
        expect(stdout).toBe("abc");
        done();
    }).catch((error) => {
        expect(error).toBeNull();
        done(error);
    });
});
it("should able to run composed command `chie uncompiled.chiml`", (done) => {
    const chimlPath = path_1.resolve(testPath, "uncompiled.chiml");
    const command = `chie ${chimlPath}`;
    const ins = ["hello"];
    cmd_1.cmdComposedCommand(command, ins).then((stdout) => {
        expect(stdout).toBe("uncompiled hello");
        done();
    }).catch((error) => {
        console.error(error);
        expect(error).toBeNull();
        done(error);
    });
});
it("should able to run composed command `chie compiled.chiml`", (done) => {
    const chimlPath = path_1.resolve(testPath, "compiled.chiml");
    const command = `chie ${chimlPath}`;
    const ins = ["hello"];
    cmd_1.cmdComposedCommand(command, ins, {}, true).then((stdout) => {
        expect(stdout).toBe("compiled hello");
        done();
    }).catch((error) => {
        console.error(error);
        expect(error).toBeNull();
        done(error);
    });
});
//# sourceMappingURL=cmd.test.js.map