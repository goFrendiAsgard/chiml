import {resolve} from "path";
import {cmd} from "./cmd";

it("should able to run `node -e \"console.log('hello');\"`", (done) => {
  cmd("node -e \"console.log('hello');\"").then((stdout) => {
    expect(stdout).toBe("hello\n");
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done(error);
  });
});

it("should yield error when run `sendNukeToKrypton`", (done) => {
  cmd("sendNukeToKrypton").then((stdout) => {
    expect(stdout).toBeNull();
    done();
  }).catch((error) => {
    expect(error).toBeDefined();
    done();
  });
});

it("should able to run `node` interactively", (done) => {
  const scriptPath = (resolve(__dirname, "cmd.test.add.js"));
  cmd(`printf '2\n3\n' | node ${scriptPath}`).then((stdout) => {
    expect(stdout).toBe("5\n");
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done(error);
  });
});
