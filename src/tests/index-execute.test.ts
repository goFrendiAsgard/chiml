import { dirname as pathDirname, join as pathJoin, resolve as pathResolve } from "path";
import { execute } from "../index";

const fixturePath = pathJoin(pathResolve(pathDirname(pathDirname(__dirname)), "src", "tests", "fixtures"));
const containerPath = pathJoin(fixturePath, "container.yml");
const containerNoInjectionPath = pathJoin(fixturePath, "container-no-injection.yml");
const injectionAddPath = pathJoin(fixturePath, "injection-add.js");
const injectionMinusPath = pathJoin(fixturePath, "injection-minus.js");

describe("execute", () => {

    it("works with default injection", () => {
        const main = execute(containerPath);
        const result = main(2, 3);
        expect(result).toBe(5);
    });

    it("works with custom injection", () => {
        const main = execute(containerPath, injectionMinusPath);
        const result = main(3, 2);
        expect(result).toBe(1);
    });

    it("works with no injection", () => {
        const main = execute(containerNoInjectionPath);
        const result = main(3, 2);
        expect(result).toBe(5);
    });

});
