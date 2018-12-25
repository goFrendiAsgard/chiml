"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const index_1 = require("../index");
const fixturePath = path_1.join(path_1.resolve(path_1.dirname(path_1.dirname(__dirname)), "src", "tests", "fixtures"));
const containerPath = path_1.join(fixturePath, "container.yml");
const containerNoInjectionPath = path_1.join(fixturePath, "container-no-injection.yml");
const injectionAddPath = path_1.join(fixturePath, "injection-add.js");
const injectionMinusPath = path_1.join(fixturePath, "injection-minus.js");
describe("inject with default/no-injection", () => {
    it("works with default injection", () => {
        const main = index_1.inject(containerPath);
        const result = main(2, 3);
        expect(result).toBe(5);
    });
    it("works with no injection", () => {
        const main = index_1.inject(containerNoInjectionPath);
        const result = main(3, 2);
        expect(result).toBe(5);
    });
});
describe("inject with custom-injection", () => {
    it("works with custom single injection: injectionMinusPath", () => {
        const main = index_1.inject(containerPath, injectionMinusPath);
        const result = main(3, 2);
        expect(result).toBe(1);
    });
    it("works with custom injection: [injectionAddPath, injectionMinusPath]", () => {
        const main = index_1.inject(containerPath, [injectionAddPath, injectionMinusPath]);
        const result = main(3, 2);
        expect(result).toBe(1);
    });
    it("works with custom injection: [injectionMinusPath, injectionAddPath]", () => {
        const main = index_1.inject(containerPath, [injectionMinusPath, injectionAddPath]);
        const result = main(3, 2);
        expect(result).toBe(5);
    });
});
//# sourceMappingURL=index-inject.test.js.map