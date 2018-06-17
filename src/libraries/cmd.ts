import {exec} from "child_process";
import {doubleQuote} from "./stringUtil";

export function cmd(command: string, options?: {[key: string]: any}): Promise<string> {
  return new Promise((resolve, reject) => {
    const subProcess = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });

    subProcess.stdout.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    subProcess.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    function stdinListener(chunk) {
      subProcess.stdin.write(chunk);
    }

    process.stdin.on("data", stdinListener);
    subProcess.stdin.on("end", () => {
      process.stdin.end();
      process.stdin.removeListener("data", stdinListener);
    });

  });
}

export function composeCommand(command: string, ins: any[] = []): string {
  const echoes = ins.map((element) => "echo " + doubleQuote(String(element))).join(" && ");
  const inputs = ins.map((element) => doubleQuote(String(element))).join(" ");
  const composedCommand = `(${echoes}) | ${command} ${inputs}`;
  return composedCommand;
}

export function cmdComposedCommand(command: string, ins: any[] = [],
                                   options?: {[key: string]: any}): Promise<string> {
  return cmd(composeCommand(command, ins), options);
}
