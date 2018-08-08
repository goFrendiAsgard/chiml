import { tsToJs } from "./scriptTransform";

it("transform ts to js", (done) => {
    const js = tsToJs("let x: number = 1; x += 5; console.log(x);");
    expect(js).toBe("var x = 1;\nx += 5;\nconsole.log(x);\n");
    done();
});
