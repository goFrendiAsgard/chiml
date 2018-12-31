import { dirname as pathDirname, join as pathJoin, resolve as pathResolve } from "path";
import { inject } from "../index";

const fixturePath = pathJoin(pathResolve(pathDirname(pathDirname(__dirname)), "src", "tests", "fixtures"));
const containerPath = pathJoin(fixturePath, "container.yml");
const containerMultiInjectionPath = pathJoin(fixturePath, "container-multi-injection.yml");
const containerNoInjectionPath = pathJoin(fixturePath, "container-no-injection.yml");
const operationPath = pathJoin(fixturePath, "operation.js");
const operationDivisionPath = pathJoin(fixturePath, "division as calculation.js");
const operationAddPath = pathJoin(fixturePath, "operation.add.js");
const operationMinusPath = pathJoin(fixturePath, "operation.minus.js");
const geometryOopPath = pathJoin(fixturePath, "geometry.oop.js");
const geometryAreaPath = pathJoin(fixturePath, "geometry-area.yml");
const geometryGetColorPath = pathJoin(fixturePath, "geometry-getColor.yml");
const geometryGetSideLengthPath = pathJoin(fixturePath, "geometry-getSideLength.yml");
const playerContainerPath = pathJoin(fixturePath, "player.yml");
const playerInjectionPath = pathJoin(fixturePath, "Player.js");

describe("inject with default/no-injection", () => {

    it("works with default injection", () => {
        const main = inject(containerPath);
        const result = main(2, 3);
        expect(result).toBe(5);
    });

    it("works with default multi injection", () => {
        const main = inject(containerMultiInjectionPath);
        const result = main(3, 2);
        expect(result).toBe(1);
    });

    it("works with no injection", () => {
        const main = inject(containerNoInjectionPath);
        const result = main(3, 2);
        expect(result).toBe(5);
    });

});

describe("inject with custom-injection", () => {

    it("works with custom single injection: operation.js", () => {
        const main = inject(containerPath, operationPath);
        const result = main(3, 2);
        expect(result).toBe(6);
    });

    it("works with custom single injection: operation.minus.js:operation", () => {
        const main = inject(containerPath, operationMinusPath + ":operation");
        const result = main(3, 2);
        expect(result).toBe(1);
    });

    it("works with custom single injection: operation division as calculation.js as operation", () => {
        const main = inject(containerPath, operationDivisionPath + " as operation");
        const result = main(6, 2);
        expect(result).toBe(3.0);
    });

    it("works with custom injection: [operation.add.js, operation.minus.js]", () => {
        const main = inject(containerPath, [operationAddPath, operationMinusPath]);
        const result = main(3, 2);
        expect(result).toBe(1);
    });

    it("works with custom injection: [operation.minus.js, operation.add.js]", () => {
        const main = inject(containerPath, [operationMinusPath, operationAddPath]);
        const result = main(3, 2);
        expect(result).toBe(5);
    });

});

describe("inject with inherited class instance", () => {

    it("can call area()", () => {
        const main = inject(geometryAreaPath, geometryOopPath + " as geometry");
        const result = main();
        expect(result).toBe(4);
    });

    it("can call getColor()", () => {
        const main = inject(geometryGetColorPath, geometryOopPath + " as geometry");
        const result = main();
        expect(result).toBe("red");
    });

    it("can call getSideLength()", () => {
        const main = inject(geometryGetSideLengthPath, geometryOopPath + " as geometry");
        const result = main();
        expect(result).toBe(2);
    });

    it("throw error when access baseClass", () => {
        try {
            const geometry = require(geometryOopPath);
            const shape = new geometry.BaseClass();
            const area = shape.area();
            throw(new Error(`Error expected, but get result: ${area}`));
        } catch (error) {
            expect(error.message).toBe("Not implemented");
        }
    });

});
