import { RequireCache } from "@speedy/require-cache";
new RequireCache({cacheKiller: __dirname + "../package.json"}).start();

import {tsToJs} from "./scriptTransform";

it("transform ts to js", (done) => {
  const js = tsToJs("let x: number = 1; x += 5; console.log(x);");
  expect(js).toBe("var x = 1;\nx += 5;\nconsole.log(x);\n");
  done();
});
