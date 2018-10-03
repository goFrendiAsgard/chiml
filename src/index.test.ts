import { asyn, call, sync } from "./index";

describe("Translate async function into promise", async () => {

    it("Translate async function", async () => {
        async function fn(a: number, b: number) {
            return a + b;
        }
        const result = await asyn(fn)(4, 5);
        expect(result).toBe(9);
    });

});

describe("Translate node callback into promise", async () => {

    it("Translate node callback with single result", async () => {
        function fn(a: number, b: number, callback: (error, result) => any) {
            callback(null, a + b);
        }
        const result = await call(fn)(4, 5);
        expect(result).toBe(9);
    });

    it("Translate node callback with multiple results", async () => {
        function fn(a: number, b: number, callback: (error, result1, result2) => any) {
            callback(null, a + b, a - b);
        }
        const result = await call(fn)(4, 5);
        expect(result).toMatchObject([9, -1]);
    });

    it("Translate node callback that yield error", async () => {
        function fn(a: number, b: number, callback: (error, result) => any) {
            callback("error bro", a + b);
        }
        try {
            await call(fn)(4, 5);
        } catch (error) {
            expect(error).toBe("error bro");
        }
    });

});

describe("Translate sync function into promise", async () => {

    it("Translate sync function", async () => {
        function fn(a: number, b: number): number {
            return a + b;
        }
        const result = await sync(fn)(4, 5);
        expect(result).toBe(9);
    });

    it("Translate sync function that yield error", async () => {
        function fn(a: number, b: number): any {
            throw(new Error("error bro"));
        }
        try {
            await sync(fn)(4, 5);
        } catch (error) {
            expect(error.message).toBe("error bro");
        }
    });

});
