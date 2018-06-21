import {dirname as pathDirName, resolve as pathResolve} from "path";
import {cmd, cmdComposedCommand, composeCommand} from "./cmd";

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
const testPath = pathResolve(rootDirPath, "testcase", "cmd");
const addJsPath = pathResolve(testPath, "add.js");

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
  const chimlPath = pathResolve(testPath, "uncompiled.chiml");
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
  const chimlPath = pathResolve(testPath, "compiled.chiml");
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
