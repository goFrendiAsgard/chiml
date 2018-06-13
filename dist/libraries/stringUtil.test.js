"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stringUtil_1 = require("./stringUtil");
it("able to smartsplit", (done) => {
    const result = stringUtil_1.smartSplit("'a -> b' -> \"$a->call();\" -> \"c->d\"", "->");
    expect(result[0]).toBe("'a -> b'");
    expect(result[1]).toBe("\"$a->call();\"");
    expect(result[2]).toBe("\"c->d\"");
    done();
});
it("able to recognized flanks", (done) => {
    const result1 = stringUtil_1.isFlanked("(abc)", "(", ")");
    expect(result1).toBeTruthy();
    const result2 = stringUtil_1.isFlanked("(abc", "(", ")");
    expect(result2).toBeFalsy();
    const result3 = stringUtil_1.isFlanked("abc)", "(", ")");
    expect(result3).toBeFalsy();
    const result4 = stringUtil_1.isFlanked("abc", "(", ")");
    expect(result4).toBeFalsy();
    done();
});
it("able to remove parantheses", (done) => {
    const result1 = stringUtil_1.removeFlank("(abc)", "(", ")");
    expect(result1).toBe("abc");
    const result2 = stringUtil_1.removeFlank("(abc", "(", ")");
    expect(result2).toBe("(abc");
    const result3 = stringUtil_1.removeFlank("abc)", "(", ")");
    expect(result3).toBe("abc)");
    const result4 = stringUtil_1.removeFlank("abc", "(", ")");
    expect(result4).toBe("abc");
    done();
});
//# sourceMappingURL=stringUtil.test.js.map