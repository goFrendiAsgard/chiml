import { Readable, Writable } from "stream";
import { createPrompt, print } from "../../libraries/inputOutput";

test("able to print", () => {
    print("hello", (error) => {
        expect(error).toBeNull();
    });
});

test("able to prompt", () => {
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
    });
    rl.write("Hello\r\n");
});
