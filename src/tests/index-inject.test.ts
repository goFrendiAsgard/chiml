import { dirname as pathDirname, join as pathJoin, resolve as pathResolve } from "path";
import { inject } from "../index";

const fixturePath = pathJoin(pathResolve(pathDirname(pathDirname(__dirname)), "src", "tests", "fixtures"));
const containerPath = pathJoin(fixturePath, "container.yml");
const containerNoInjectionPath = pathJoin(fixturePath, "container-no-injection.yml");
const injectionAddPath = pathJoin(fixturePath, "injection-add.js");
const injectionMinusPath = pathJoin(fixturePath, "injection-minus.js");

describe("inject with default/no-injection", () => {

    it("works with default injection", () => {
        const main = inject(containerPath);
        const result = main(2, 3);
        expect(result).toBe(5);
    });

    it("works with no injection", () => {
        const main = inject(containerNoInjectionPath);
        const result = main(3, 2);
        expect(result).toBe(5);
    });

});

describe("inject with custom-injection", () => {

    it("works with custom single injection: injectionMinusPath", () => {
        const main = inject(containerPath, injectionMinusPath);
        const result = main(3, 2);
        expect(result).toBe(1);
    });

    it("works with custom injection: [injectionAddPath, injectionMinusPath]", () => {
        const main = inject(containerPath, [injectionAddPath, injectionMinusPath]);
        const result = main(3, 2);
        expect(result).toBe(1);
    });

    it("works with custom injection: [injectionMinusPath, injectionAddPath]", () => {
        const main = inject(containerPath, [injectionMinusPath, injectionAddPath]);
        const result = main(3, 2);
        expect(result).toBe(5);
    });

});
