"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const stringUtil_1 = require("./stringUtil");
const chimlSample1 = `
# comment
ins: a, b
out: f
do:
    - |(a, b) -> (x, y) => x + y -> c
    - |(a, b) -> (x, y) => x - y -> d
    # comment
    - do: |(c, d) -> (x, y) => x * y -> e
    - do: |("result: " + e) --> f
`;
const chimlSample1Unblocked = `
# comment
ins: a, b
out: f
do:
    - (a, b) -> (x, y) => x + y -> c
    - (a, b) -> (x, y) => x - y -> d
    # comment
    - do: (c, d) -> (x, y) => x * y -> e
    - do: ("result: " + e) --> f
`;
const expectedYaml1 = `
# comment
ins: a, b
out: f
do:
    - "(a, b) -> (x, y) => x + y -> c"
    - "(a, b) -> (x, y) => x - y -> d"
    # comment
    - do: "(c, d) -> (x, y) => x * y -> e"
    - do: "(\\\"result: \\\" + e) --> f"
`.trim();
const chimlSample2 = `
ins: a, b
out: f
do:
    - parallel:
        - |(a, b) -> (x, y) => x + y -> c
        - |(a, b) -> (x, y) => x - y -> d
    - ins:
            - c
            - d
        out: e
        do: (x, y) => x * y
    - do: |
            () => {
                return "smile";
            }
    - do: |("result: " + e) --> f
`;
const chimlSample2Unblocked = `
ins: a, b
out: f
do:
    - parallel:
        - (a, b) -> (x, y) => x + y -> c
        - (a, b) -> (x, y) => x - y -> d
    - ins:
            - c
            - d
        out: e
        do: (x, y) => x * y
    - do: |
            () => {
                return "smile";
            }
    - do: ("result: " + e) --> f
`;
const expectedYaml2 = `
ins: a, b
out: f
do:
    - parallel:
        - "(a, b) -> (x, y) => x + y -> c"
        - "(a, b) -> (x, y) => x - y -> d"
    - ins:
            - c
            - d
        out: e
        do: "(x, y) => x * y"
    - do: |
            () => {
                return "smile";
            }
    - do: "(\\\"result: \\\" + e) --> f"
`.trim();
const chimlSample3 = `|("Hello" + name) --> output`;
const chimlSample3Unblocked = `("Hello" + name) --> output`;
const expectedYaml3 = `"(\\\"Hello\\\" + name) --> output"`;
const chimlSample4 = `do: |("Hello" + name) --> output`;
const chimlSample4Unblocked = `do: ("Hello" + name) --> output`;
const expectedYaml4 = `do: "(\\\"Hello\\\" + name) --> output"`;
it("able to translate chiml into yaml", (done) => {
    expect(stringUtil_1.chimlToYaml(chimlSample1)).toBe(expectedYaml1);
    expect(stringUtil_1.chimlToYaml(chimlSample1Unblocked)).toBe(expectedYaml1);
    expect(stringUtil_1.chimlToYaml(chimlSample2)).toBe(expectedYaml2);
    expect(stringUtil_1.chimlToYaml(chimlSample2Unblocked)).toBe(expectedYaml2);
    expect(stringUtil_1.chimlToYaml(chimlSample3)).toBe(expectedYaml3);
    expect(stringUtil_1.chimlToYaml(chimlSample3Unblocked)).toBe(expectedYaml3);
    expect(stringUtil_1.chimlToYaml(chimlSample4)).toBe(expectedYaml4);
    expect(stringUtil_1.chimlToYaml(chimlSample4Unblocked)).toBe(expectedYaml4);
    done();
});
it("able to parse string array", (done) => {
    const result = stringUtil_1.parseStringArray(["1", "abc", "false", "{\"a\": 5}"]);
    expect(result.length).toBe(4);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe("abc");
    expect(result[2]).toBe(false);
    expect(result[3]).toMatchObject({ a: 5 });
    done();
});
it("able to turn chiml file and chiml script into config", (done) => {
    const rootDirPath = path_1.dirname(path_1.dirname(__dirname));
    const testDirPath = path_1.resolve(rootDirPath, "testcase");
    const p1 = stringUtil_1.chimlToConfig(path_1.resolve(testDirPath, "stringUtil", "sample.chiml"));
    const p2 = stringUtil_1.chimlToConfig(chimlSample1);
    const p3 = stringUtil_1.chimlToConfig(path_1.resolve(testDirPath, "stringUtil", "test.chiml"));
    Promise.all([p1, p2, p3])
        .then(([result1, result2, result3]) => {
        expect(result1).toMatchObject(result2);
        expect(result3.commandList.length).toBe(2);
        expect(result1.__isNormal).toBeTruthy();
        expect(result2.__isNormal).toBeTruthy();
        expect(result3.__isNormal).toBeTruthy();
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("able to turn nonexisting chiml file into config", (done) => {
    stringUtil_1.chimlToConfig("nonexists.chiml")
        .then((result) => {
        expect(result.__isNormal).toBeTruthy();
        expect(result.command).toBe("nonexists.chiml");
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("able to turn json-string into config", (done) => {
    const json = { vars: { a: 5, b: 7 }, ins: "x, y" };
    stringUtil_1.chimlToConfig(JSON.stringify(json))
        .then((result) => {
        expect(result.vars).toMatchObject(json.vars);
        expect(result.ins.length).toBe(2);
        expect(result.ins[0]).toBe("x");
        expect(result.ins[1]).toBe("y");
        expect(result.__isNormal).toBeTruthy();
        done();
    })
        .catch((error) => {
        expect(error).toBeNull();
        done();
    });
});
it("should fail to parse invalid yaml", (done) => {
    stringUtil_1.chimlToConfig("key: val\n   misindentKey: otherVal")
        .then((result) => {
        expect(result).toBeUndefined();
        done();
    })
        .catch((error) => {
        expect(error).toBeDefined();
        done();
    });
});
it("able to smartsplit", (done) => {
    const result1 = stringUtil_1.smartSplit("'a -> b' -> \"$a->call();\" -> \"c->d\"", "->");
    expect(result1.length).toBe(3);
    expect(result1[0]).toBe("'a -> b'");
    expect(result1[1]).toBe("\"$a->call();\"");
    expect(result1[2]).toBe("\"c->d\"");
    const result2 = stringUtil_1.smartSplit("a, b, c", "->");
    expect(result2.length).toBe(1);
    expect(result2[0]).toBe("a, b, c");
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
it("able to double quote", (done) => {
    const result1 = stringUtil_1.doubleQuote("System.out.println(\"Hello world\");");
    expect(result1).toBe("\"System.out.println(\\\"Hello world\\\");\"");
    done();
});
//# sourceMappingURL=stringUtil.test.js.map