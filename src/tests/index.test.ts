import { X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";

describe("Piping work", () => {

    it ("pipe", async () => {
        // composition
        const asyncRootSquare = X.wrapCommand(1, commandRootSquare);
        const asyncMultiply = X.wrapNodeback(2, nodebackMultiply);
        const asyncAdd = X.wrapSync(2, syncAdd);
        const asyncAddAndMinus = X.parallel(2, [asyncAdd, asyncMinus]);
        const convergedAsyncMultiply = X.convergeInput(asyncMultiply);
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

});
