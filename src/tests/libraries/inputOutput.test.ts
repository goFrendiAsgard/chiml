import { Readable, Writable } from "stream";
import { createPrompt, print } from "../../libraries/inputOutput";

test("able to print", (done) => {
    print("hello", (error) => {
        expect(error).toBeNull();
        done();
    });
});

test("able to prompt", (done) => {
    const prompt = createPrompt({
        input: new Readable({
            read(size) {
                console.log("Read");
            },
        }),
        output: new Writable({
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
