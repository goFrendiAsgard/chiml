"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function cmd(command, options) {
    return new Promise((resolve, reject) => {
        const subProcess = child_process_1.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
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
exports.cmd = cmd;
//# sourceMappingURL=cmd.js.map