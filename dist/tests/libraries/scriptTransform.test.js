"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scriptTransform_1 = require("../../libraries/scriptTransform");
test("transform ts to js", () => {
    const js = scriptTransform_1.tsToJs("let x: number = 1; x += 5; console.log(x);");
    expect(js).toBe("var x = 1;\nx += 5;\nconsole.log(x);\n");
});
