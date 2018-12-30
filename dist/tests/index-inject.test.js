"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const index_1 = require("../index");
const fixturePath = path_1.join(path_1.resolve(path_1.dirname(path_1.dirname(__dirname)), "src", "tests", "fixtures"));
const containerPath = path_1.join(fixturePath, "container.yml");
const containerMultiInjectionPath = path_1.join(fixturePath, "container-multi-injection.yml");
const containerNoInjectionPath = path_1.join(fixturePath, "container-no-injection.yml");
const operationPath = path_1.join(fixturePath, "operation.js");
const operationDivisionPath = path_1.join(fixturePath, "division as calculation.js");
const operationAddPath = path_1.join(fixturePath, "operation.add.js");
const operationMinusPath = path_1.join(fixturePath, "operation.minus.js");
const geometryOopPath = path_1.join(fixturePath, "geometry.oop.js");
const geometryAreaPath = path_1.join(fixturePath, "geometry-area.yml");
const geometryGetColorPath = path_1.join(fixturePath, "geometry-getColor.yml");
const geometryGetSideLengthPath = path_1.join(fixturePath, "geometry-getSideLength.yml");
describe("inject with default/no-injection", () => {
    it("works with default injection", () => {
        const main = index_1.inject(containerPath);
        const result = main(2, 3);
        expect(result).toBe(5);
    });
    it("works with default multi injection", () => {
        const main = index_1.inject(containerMultiInjectionPath);
        const result = main(3, 2);
        expect(result).toBe(1);
    });
    it("works with no injection", () => {
        const main = index_1.inject(containerNoInjectionPath);
        const result = main(3, 2);
        expect(result).toBe(5);
    });
});
describe("inject with custom-injection", () => {
    it("works with custom single injection: operation.js", () => {
        const main = index_1.inject(containerPath, operationPath);
        const result = main(3, 2);
        expect(result).toBe(6);
    });
    it("works with custom single injection: operation.minus.js:operation", () => {
        const main = index_1.inject(containerPath, operationMinusPath + ":operation");
        const result = main(3, 2);
        expect(result).toBe(1);
    });
    it("works with custom single injection: operation division as calculation.js as operation", () => {
        const main = index_1.inject(containerPath, operationDivisionPath + " as operation");
        const result = main(6, 2);
        expect(result).toBe(3.0);
    });
    it("works with custom injection: [operation.add.js, operation.minus.js]", () => {
        const main = index_1.inject(containerPath, [operationAddPath, operationMinusPath]);
        const result = main(3, 2);
        expect(result).toBe(1);
    });
    it("works with custom injection: [operation.minus.js, operation.add.js]", () => {
        const main = index_1.inject(containerPath, [operationMinusPath, operationAddPath]);
        const result = main(3, 2);
        expect(result).toBe(5);
    });
});
describe("inject with inherited class instance", () => {
    it("can call area()", () => {
        const main = index_1.inject(geometryAreaPath, geometryOopPath + " as geometry");
        const result = main();
        expect(result).toBe(4);
    });
    it("can call getColor()", () => {
        const main = index_1.inject(geometryGetColorPath, geometryOopPath + " as geometry");
        const result = main();
        expect(result).toBe("red");
    });
    it("can call getSideLength()", () => {
        const main = index_1.inject(geometryGetSideLengthPath, geometryOopPath + " as geometry");
        const result = main();
        expect(result).toBe(2);
    });
    it("throw error when access baseClass", () => {
        try {
            const geometry = require(geometryOopPath);
            const shape = new geometry.BaseClass();
            const area = shape.area();
            throw (new Error(`Error expected, but get result: ${area}`));
        }
        catch (error) {
            expect(error.message).toBe("Not implemented");
        }
    });
});
//# sourceMappingURL=index-inject.test.js.map