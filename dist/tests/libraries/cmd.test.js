"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const cmd_1 = require("../../libraries/cmd");
const rootDirPath = path_1.dirname(path_1.dirname(path_1.dirname(__dirname)));
const cmdTestPath = path_1.resolve(rootDirPath, "testcase", "cmd");
const nestedTestPath = path_1.resolve(rootDirPath, "testcase", "nested");
const addJsPath = path_1.resolve(cmdTestPath, "add.js");
const helloJsPath = path_1.resolve(cmdTestPath, "hello.js");
test("should able to run `node -e \"console.log('hello');\"`", () => {
    return cmd_1.cmd("node -e \"console.log('hello');\"")
        .then((stdout) => {
        expect(stdout).toBe("hello\n");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should yield error when run `sendNukeToKrypton` (assuming that command is not exists)", () => {
    return cmd_1.cmd("sendNukeToKrypton")
        .then((stdout) => {
        expect(stdout).toBeNull();
    })
        .catch((error) => {
        expect(error).toBeDefined();
    });
});
test("should able to run `node add.js` with input redirection", () => {
    return cmd_1.cmd(`(echo "2" && echo "3") | node ${addJsPath}`)
        .then((stdout) => {
        expect(stdout).toBe("5\n");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should able to compose command `node add.js` and run it", () => {
    const command = `node ${addJsPath}`;
    const ins = [7, 4];
    const composedCommand = cmd_1.composeCommand(command, ins);
    expect(composedCommand).toBe(`(echo "7" && echo "4") | ${command} "7" "4"`);
    return cmd_1.cmdComposedCommand(command, ins)
        .then((stdout) => {
        expect(stdout).toBe(11);
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should able to compose command `node hello.js` and run it", () => {
    const command = `node ${helloJsPath}`;
    const composedCommand = cmd_1.composeCommand(command);
    expect(composedCommand).toBe(`${command}`);
    return cmd_1.cmdComposedCommand(command)
        .then((stdout) => {
        expect(stdout).toBe("hello");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should able to compose command `node hello.js` and run it", () => {
    const command = `node ${helloJsPath}`;
    const composedCommand = cmd_1.composeCommand(command);
    expect(composedCommand).toBe(`${command}`);
    return cmd_1.cmdComposedCommand(command, [], {}, true)
        .then((stdout) => {
        expect(stdout).toBe("hello");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should able to compose command `echo` and run it", () => {
    const command = "echo";
    const ins = ["hello"];
    const composedCommand = cmd_1.composeCommand(command, ins);
    expect(composedCommand).toBe('(echo "hello") | echo "hello"');
    return cmd_1.cmdComposedCommand(command, ins)
        .then((stdout) => {
        expect(stdout).toBe("hello");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should able to compose command `echo abc` and run it", () => {
    const command = "echo abc";
    const ins = [];
    const composedCommand = cmd_1.composeCommand(command, ins);
    expect(composedCommand).toBe("echo abc");
    return cmd_1.cmdComposedCommand(command, ins)
        .then((stdout) => {
        expect(stdout).toBe("abc");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should able to run composed command `chie uncompiled.chiml`", () => {
    const chimlPath = path_1.resolve(cmdTestPath, "uncompiled.chiml");
    const command = `chie ${chimlPath}`;
    const ins = ["hello"];
    return cmd_1.cmdComposedCommand(command, ins)
        .then((stdout) => {
        expect(stdout).toBe("uncompiled hello");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("should able to run composed command `chie compiled.chiml`", () => {
    const chimlPath = path_1.resolve(cmdTestPath, "compiled.chiml");
    const command = `chie ${chimlPath}`;
    const ins = ["hello"];
    return cmd_1.cmdComposedCommand(command, ins, {}, true)
        .then((stdout) => {
        expect(stdout).toBe("compiled hello");
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
});
test("compile test.chiml", () => {
    const childChimlPath = path_1.resolve(nestedTestPath, "child.chiml");
    const parentChimlPath = path_1.resolve(nestedTestPath, "parent.chiml");
    const childJsPath = path_1.resolve(nestedTestPath, "child.js");
    const parentJsPath = path_1.resolve(nestedTestPath, "parent.js");
    const nodeModulePath = path_1.resolve(nestedTestPath, "node_modules");
    const cachePath = path_1.resolve(nestedTestPath, ".cache");
    return new Promise((resolve, reject) => {
        cmd_1.cmdComposedCommand("chie parent.chiml", [10, 8], { cwd: nestedTestPath }, true)
            .then((result) => {
            expect(result).toBeNull();
            resolve(true);
        })
            .catch((error) => {
            expect(error).toBeDefined();
            resolve(true);
        });
    })
        .then(() => {
        return cmd_1.cmdComposedCommand("chic", [childChimlPath, parentChimlPath]);
    })
        .then(() => {
        return cmd_1.cmdComposedCommand("node", [parentJsPath, 10, 8]);
    })
        .then((result) => {
        expect(result).toBe(18);
    })
        .then(() => {
        return cmd_1.cmdComposedCommand("chie", [parentChimlPath, 10, 8], { cwd: nestedTestPath });
    })
        .then((result) => {
        expect(result).toBe(2);
    })
        .then(() => {
        return Promise.all([
            fs_extra_1.remove(nodeModulePath),
            fs_extra_1.remove(cachePath),
            fs_extra_1.remove(childJsPath),
            fs_extra_1.remove(parentJsPath),
        ]);
    })
        .catch((error) => {
        console.error(error);
        expect(error).toBeNull();
    });
}, 100000);
