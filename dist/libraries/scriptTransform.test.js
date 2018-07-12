"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const require_cache_1 = require("@speedy/require-cache");
new require_cache_1.RequireCache({ cacheKiller: __dirname + "../package.json" }).start();
const scriptTransform_1 = require("./scriptTransform");
it("transform ts to js", (done) => {
    const js = scriptTransform_1.tsToJs("let x: number = 1; x += 5; console.log(x);");
    expect(js).toBe("var x = 1;\nx += 5;\nconsole.log(x);\n");
    done();
});
//# sourceMappingURL=scriptTransform.test.js.map