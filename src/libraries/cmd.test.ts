import {remove as fsRemove} from "fs-extra";
import {dirname as pathDirName, resolve as pathResolve} from "path";
import {cmd, cmdComposedCommand, composeCommand} from "./cmd";
import {compile, execute, getCompiledScript, getFiles} from "./tools";

it("should able to run `node -e \"console.log('hello');\"`", (done) => {
  cmd("node -e \"console.log('hello');\"").then((stdout) => {
    expect(stdout).toBe("hello\n");
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done(error);
  });
});

it("should yield error when run `sendNukeToKrypton` (assuming that command is not exists)", (done) => {
  cmd("sendNukeToKrypton").then((stdout) => {
    expect(stdout).toBeNull();
    done();
  }).catch((error) => {
    expect(error).toBeDefined();
    done();
  });
});

const rootDirPath = pathDirName(pathDirName(__dirname));
const cmdTestPath = pathResolve(rootDirPath, "testcase", "cmd");
const nestedTestPath = pathResolve(rootDirPath, "testcase", "nested");
const addJsPath = pathResolve(cmdTestPath, "add.js");

it("should able to run `node add.js` with input redirection", (done) => {
  cmd(`(echo "2" && echo "3") | node ${addJsPath}`).then((stdout) => {
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
  const composedCommand = composeCommand(command, ins);
  expect(composedCommand).toBe(`(echo "7" && echo "4") | ${command} "7" "4"`);
  cmdComposedCommand(command, ins).then((stdout) => {
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
  const composedCommand = composeCommand(command, ins);
  expect(composedCommand).toBe('(echo "hello") | echo "hello"');
  cmdComposedCommand(command, ins).then((stdout) => {
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
  const composedCommand = composeCommand(command, ins);
  expect(composedCommand).toBe("echo abc");
  cmdComposedCommand(command, ins).then((stdout) => {
    expect(stdout).toBe("abc");
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done(error);
  });
});

it("should able to run composed command `chie uncompiled.chiml`", (done) => {
  const chimlPath = pathResolve(cmdTestPath, "uncompiled.chiml");
  const command = `chie ${chimlPath}`;
  const ins = ["hello"];
  cmdComposedCommand(command, ins).then((stdout) => {
    expect(stdout).toBe("uncompiled hello");
    done();
  }).catch((error) => {
    console.error(error);
    expect(error).toBeNull();
    done(error);
  });
});

it("should able to run composed command `chie compiled.chiml`", (done) => {
  const chimlPath = pathResolve(cmdTestPath, "compiled.chiml");
  const command = `chie ${chimlPath}`;
  const ins = ["hello"];
  cmdComposedCommand(command, ins, {}, true).then((stdout) => {
    expect(stdout).toBe("compiled hello");
    done();
  }).catch((error) => {
    console.error(error);
    expect(error).toBeNull();
    done(error);
  });
});

it("compile test.chiml", (done) => {
  const childChimlPath = pathResolve(nestedTestPath, "child.chiml");
  const parentChimlPath = pathResolve(nestedTestPath, "parent.chiml");
  const childJsPath = pathResolve(nestedTestPath, "child.js");
  const parentJsPath = pathResolve(nestedTestPath, "parent.js");
  const nodeModulePath = pathResolve(nestedTestPath, "node_modules");
  new Promise((resolve, reject) => {
    cmdComposedCommand("chie parent.chiml", [10, 8], {cwd: nestedTestPath}, true).then((result) => {
      expect(result).toBeUndefined();
      resolve(true);
    }).catch((error) => {
      expect(error).toBeDefined();
      resolve(true);
    });
  }).then(() => {
    return cmdComposedCommand("chic", [childChimlPath, parentChimlPath]);
  }).then(() => {
    return cmdComposedCommand("node", [parentJsPath, 10, 8]);
  }).then((result) => {
    expect(result).toBe(18);
  }).then(() => {
    return cmdComposedCommand("chie", [parentChimlPath, 10, 8], {cwd: nestedTestPath});
  }).then((result) => {
    expect(result).toBe(2);
  }).then(() => {
    return Promise.all([
      fsRemove(nodeModulePath),
      fsRemove(childJsPath),
      fsRemove(parentJsPath),
    ]);
  }).then(() => {
    done();
  }).catch((error) => {
    console.error(error);
    expect(error).toBeUndefined();
    done();
  });
}, 60000);
