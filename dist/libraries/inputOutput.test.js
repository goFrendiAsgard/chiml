"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const inputOutput_1 = require("./inputOutput");
it("able to print", (done) => {
    inputOutput_1.print("hello", (error, result) => {
        expect(error).toBeNull();
        done();
    });
});
it("able to prompt", (done) => {
    const prompt = inputOutput_1.createPrompt({
        input: new stream_1.Readable({
            read(size) {
                console.log("Read");
            },
        }),
        output: new stream_1.Writable({
            write(chunk, controller) {
                console.log(String(chunk));
            },
        }),
    });
    const rl = prompt("Say something", (error, result) => {
        expect(error).toBeNull();
        expect(result).toBe("Hello");
        done();
    });
    rl.write("Hello\r\n");
});
//# sourceMappingURL=inputOutput.test.js.map