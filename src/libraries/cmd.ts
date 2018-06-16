import {exec} from "child_process";

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
