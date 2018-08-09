import { tsToJs } from "../../libraries/scriptTransform";

test("transform ts to js", () => {
    const js = tsToJs("let x: number = 1; x += 5; console.log(x);");
    expect(js).toBe("var x = 1;\nx += 5;\nconsole.log(x);\n");
});
