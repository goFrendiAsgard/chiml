import {exec} from "child_process";
import {isAbsolute as isAbsolutePath, resolve as pathResolve} from "path";
import {doubleQuote, smartSplit} from "./stringUtil";

export function cmd(command: string, options?: {[key: string]: any}): Promise<string> {
  return new Promise((resolve, reject) => {
    const subProcess = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve(stdout);
    });

    subProcess.stdout.on("data", (chunk) => {
      process.stderr.write("\x1b[33m" + String(chunk) + "\x1b[0m");
    });

    subProcess.stderr.on("data", (chunk) => {
      process.stderr.write("\x1b[31m" + String(chunk) + "\x1b[0m");
    });

    function stdinListener(chunk) {
      subProcess.stdin.write(chunk);
    }

    process.stdin.on("data", stdinListener);
    subProcess.stdin.on("end", () => {
      process.stdin.removeListener("data", stdinListener);
      process.stdin.end();
    });
    subProcess.stdin.on("error", (error) => console.error(error));
    process.stdin.on("error", (error) => console.error(error));

  });
}

export function composeCommand(command: string, ins: any[] = []): string {
  if (ins.length === 0) {
    return command;
  }
  const echoes = ins.map((element) => "echo " + doubleQuote(String(element))).join(" && ");
  const inputs = ins.map((element) => doubleQuote(String(element))).join(" ");
  const composedCommand = `(${echoes}) | ${command} ${inputs}`;
  return composedCommand;
}

function runCompiledChiml(scriptPath, ins: any[]): Promise<any> {
  try {
    const mainFunction = require(scriptPath);
    return mainFunction(...ins);
  } catch (error) {
    return Promise.reject(error);
  }
}

export function cmdComposedCommand(
  command: string, ins: any[] = [], opts?: {[key: string]: any}, isCompiled: boolean = false): Promise<any> {
  if (isCompiled) {
    const commandParts = smartSplit(command, " ").filter((part) => part !== "");
    if (commandParts.length > 1 && commandParts[0] === "chie") {
      const chimlPath = commandParts[1];
      const scriptPath = chimlPath.replace(/^(.*)\.chiml$/gmi, (match, fileName) => {
        if ("cwd" in opts && opts.cwd !== null && !isAbsolutePath(chimlPath)) {
          const cwd = opts.cwd;
          return pathResolve(cwd, `${fileName}.js`);
        }
        return `${fileName}.js`;
      });
      if (chimlPath !== scriptPath) {
        const inputs = commandParts.slice(2).concat(ins);
        return runCompiledChiml(scriptPath, inputs);
      }
    }
  }
  return cmd(composeCommand(command, ins), opts).then((result) => {
    return new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(result.trim()));
      } catch (error) {
        resolve(result.trim());
      }
    });
  });
}
