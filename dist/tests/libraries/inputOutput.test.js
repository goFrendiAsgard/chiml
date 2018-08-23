"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const inputOutput_1 = require("../../libraries/inputOutput");
test("able to print", (done) => {
    const print = inputOutput_1.createPrint();
    print("hello", (error) => {
        expect(error).toBeNull();
        done();
    });
});
test("able to prompt", (done) => {
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
