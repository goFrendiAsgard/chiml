import { X } from "../index";
import { asyncMinus, commandRootSquare, nodebackMultiply, syncAdd } from "./fixtures/lib";

describe("wrap non promise and non function", () => {

    it ("single number works", async () => {
        const addAndMinus = X.parallel(2, [syncAdd, asyncMinus]);
        const multiply = X.then(
            X.reduce(X.nodeback(2, nodebackMultiply), 1),
        );
        const rootSquare = X.then(
            X.command(1, commandRootSquare),
        );
        const main = (...args) => {
            return rootSquare(multiply(addAndMinus(...args)));
        };
        const result = await main(10, 6);
        expect(result).toBe(8);
        return null;
    });

});
