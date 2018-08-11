import { remove as fsRemove } from "fs-extra";
import { dirname as pathDirName, resolve as pathResolve } from "path";
import { cmd, cmdComposedCommand, composeCommand } from "../../libraries/cmd";

const rootDirPath = pathDirName(pathDirName(pathDirName(__dirname)));
const cmdTestPath = pathResolve(rootDirPath, "testcase", "cmd");
const nestedTestPath = pathResolve(rootDirPath, "testcase", "nested");
const addJsPath = pathResolve(cmdTestPath, "add.js");
const helloJsPath = pathResolve(cmdTestPath, "hello.js");

test("should able to run `node -e \"console.log('hello');\"`", () => {
   return cmd("node -e \"console.log('hello');\"")
        .then((stdout) => {
            expect(stdout).toBe("hello\n");
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("should yield error when run `sendNukeToKrypton` (assuming that command is not exists)", () => {
    return cmd("sendNukeToKrypton")
        .then((stdout) => {
            expect(stdout).toBeNull();
        })
        .catch((error) => {
            expect(error).toBeDefined();
        });
});

test("should able to run `node add.js` with input redirection", () => {
    return cmd(`(echo "2" && echo "3") | node ${addJsPath}`)
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
    const composedCommand = composeCommand(command, ins);
    expect(composedCommand).toBe(`(echo "7" && echo "4") | ${command} "7" "4"`);
    return cmdComposedCommand(command, ins)
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
    const composedCommand = composeCommand(command);
    expect(composedCommand).toBe(`${command}`);
    return cmdComposedCommand(command)
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
    const composedCommand = composeCommand(command);
    expect(composedCommand).toBe(`${command}`);
    return cmdComposedCommand(command, [], {}, true)
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
    const composedCommand = composeCommand(command, ins);
    expect(composedCommand).toBe('(echo "hello") | echo "hello"');
    return cmdComposedCommand(command, ins)
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
    const composedCommand = composeCommand(command, ins);
    expect(composedCommand).toBe("echo abc");
    return cmdComposedCommand(command, ins)
        .then((stdout) => {
            expect(stdout).toBe("abc");
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("should able to run composed command `chie uncompiled.chiml`", () => {
    const chimlPath = pathResolve(cmdTestPath, "uncompiled.chiml");
    const command = `chie ${chimlPath}`;
    const ins = ["hello"];
    return cmdComposedCommand(command, ins)
        .then((stdout) => {
            expect(stdout).toBe("uncompiled hello");
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("should able to run composed command `chie compiled.chiml`", () => {
    const chimlPath = pathResolve(cmdTestPath, "compiled.chiml");
    const command = `chie ${chimlPath}`;
    const ins = ["hello"];
    return cmdComposedCommand(command, ins, {}, true)
        .then((stdout) => {
            expect(stdout).toBe("compiled hello");
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
});

test("compile test.chiml", () => {
    const childChimlPath = pathResolve(nestedTestPath, "child.chiml");
    const parentChimlPath = pathResolve(nestedTestPath, "parent.chiml");
    const childJsPath = pathResolve(nestedTestPath, "child.js");
    const parentJsPath = pathResolve(nestedTestPath, "parent.js");
    const nodeModulePath = pathResolve(nestedTestPath, "node_modules");
    const cachePath = pathResolve(nestedTestPath, ".cache");
    return new Promise((resolve, reject) => {
        cmdComposedCommand("chie parent.chiml", [10, 8], { cwd: nestedTestPath }, true)
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
            return cmdComposedCommand("chic", [childChimlPath, parentChimlPath]);
        })
        .then(() => {
            return cmdComposedCommand("node", [parentJsPath, 10, 8]);
        })
        .then((result) => {
            expect(result).toBe(18);
        })
        .then(() => {
            return cmdComposedCommand("chie", [parentChimlPath, 10, 8], { cwd: nestedTestPath });
        })
        .then((result) => {
            expect(result).toBe(2);
        })
        .then(() => {
            return Promise.all([
                fsRemove(nodeModulePath),
                fsRemove(cachePath),
                fsRemove(childJsPath),
                fsRemove(parentJsPath),
            ]);
        })
        .catch((error) => {
            console.error(error);
            expect(error).toBeNull();
        });
}, 100000);
