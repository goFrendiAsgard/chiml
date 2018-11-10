import { X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";

describe("Case", () => {

    it ("Imperative Style", async () => {
        // composition
        const asyncRootSquare = X.wrapCommand(commandRootSquare);
        const asyncMultiply = X.wrapNodeback(nodebackMultiply);
        const asyncAdd = X.wrapSync(syncAdd);
        const asyncAddAndMinus = X.parallel(asyncAdd, asyncMinus);
        const convergedAsyncMultiply = X.foldInput(asyncMultiply);
        const main: (a: number, b: number) => Promise<number> = X.pipeP(
            asyncAddAndMinus,
            convergedAsyncMultiply,
            asyncRootSquare,
        );
        // action
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

    it ("Declarative Style", async () => {
        const main = X.declarative({
            // vals can contains any values/JavaScript object
            vals: { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd, ...X },
            // comp should only contains valid JSON object
            comp: {
                asyncRootSquare: {
                    vals: ["<commandRootSquare>"],
                    pipe: "wrapCommand",
                },
                asyncMultiply: {
                    vals: ["<nodebackMultiply>"],
                    pipe: "wrapCommand",
                },
                asyncAdd: {
                    vals: ["<syncAdd>"],
                    pipe: "wrapCommand",
                },
                asyncAddAndMinus: {
                    vals: ["<asyncAdd>", "<asyncMinus>"],
                    pipe: "wrapCommand",
                },
                convergedAsyncMultiply: {
                    vals: ["<asyncMultiply>"],
                    pipe: "wrapCommand",
                },
                main: {
                    vals: [
                        "<asyncAddAndMinus>",
                        "<convergedAsyncMultiply>",
                        "<asyncRootSquare>",
                    ],
                    pipe: "pipeP",
                },
            },
            main: "<main>",
        });
        // action
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

});
