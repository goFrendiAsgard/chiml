import { dirname as pathDirName, resolve as pathResolve } from "path";
import {
    chimlToConfig,
    chimlToYaml,
    doubleQuote,
    isFlanked,
    parseStringArray,
    removeFlank,
    smartSplit,
} from "../../libraries/stringUtil";

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

test("able to translate chiml into yaml", () => {
    expect(chimlToYaml(chimlSample1)).toBe(expectedYaml1);
    expect(chimlToYaml(chimlSample1Unblocked)).toBe(expectedYaml1);
    expect(chimlToYaml(chimlSample2)).toBe(expectedYaml2);
    expect(chimlToYaml(chimlSample2Unblocked)).toBe(expectedYaml2);
    expect(chimlToYaml(chimlSample3)).toBe(expectedYaml3);
    expect(chimlToYaml(chimlSample3Unblocked)).toBe(expectedYaml3);
    expect(chimlToYaml(chimlSample4)).toBe(expectedYaml4);
    expect(chimlToYaml(chimlSample4Unblocked)).toBe(expectedYaml4);
});

test("able to parse string array", () => {
    const result = parseStringArray(["1", "abc", "false", "{\"a\": 5}"]);
    expect(result.length).toBe(4);
    expect(result[0]).toBe(1);
    expect(result[1]).toBe("abc");
    expect(result[2]).toBe(false);
    expect(result[3]).toMatchObject({ a: 5 });
});

test("able to turn chiml file and chiml script into config", () => {
    const rootDirPath = pathDirName(pathDirName(pathDirName(__dirname)));
    const testDirPath = pathResolve(rootDirPath, "testcase");
    const p1 = chimlToConfig(pathResolve(testDirPath, "stringUtil", "sample.chiml"));
    const p2 = chimlToConfig(chimlSample1);
    const p3 = chimlToConfig(pathResolve(testDirPath, "stringUtil", "test.chiml"));
    return Promise.all([p1, p2, p3])
        .then(([result1, result2, result3]) => {
            expect(result1).toMatchObject(result2);
            expect(result3.commandList.length).toBe(2);
            expect(result1.__isNormal).toBeTruthy();
            expect(result2.__isNormal).toBeTruthy();
            expect(result3.__isNormal).toBeTruthy();
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("able to turn nonexisting chiml file into config", () => {
    return chimlToConfig("nonexists.chiml")
        .then((result) => {
            expect(result.__isNormal).toBeTruthy();
            expect(result.command).toBe("nonexists.chiml");
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("able to turn json-string into config", () => {
    const json = { vars: { a: 5, b: 7 }, ins: "x, y" };
    return chimlToConfig(JSON.stringify(json))
        .then((result) => {
            expect(result.vars).toMatchObject(json.vars);
            expect(result.ins.length).toBe(2);
            expect(result.ins[0]).toBe("x");
            expect(result.ins[1]).toBe("y");
            expect(result.__isNormal).toBeTruthy();
        })
        .catch((error) => {
            expect(error).toBeNull();
        });
});

test("should fail to parse invalid yaml", () => {
    return chimlToConfig("key: val\n   misindentKey: otherVal")
        .then((result) => {
            expect(result).toBeUndefined();
        })
        .catch((error) => {
            expect(error).toBeDefined();
        });
});

test("able to smartsplit", () => {
    const result1: string[] = smartSplit("'a -> b' -> \"$a->call();\" -> \"c->d\"", "->");
    expect(result1.length).toBe(3);
    expect(result1[0]).toBe("'a -> b'");
    expect(result1[1]).toBe("\"$a->call();\"");
    expect(result1[2]).toBe("\"c->d\"");
    const result2: string[] = smartSplit("a, b, c", "->");
    expect(result2.length).toBe(1);
    expect(result2[0]).toBe("a, b, c");
});

test("able to recognized flanks", () => {
    const result1: boolean = isFlanked("(abc)", "(", ")");
    expect(result1).toBeTruthy();

    const result2: boolean = isFlanked("(abc", "(", ")");
    expect(result2).toBeFalsy();

    const result3: boolean = isFlanked("abc)", "(", ")");
    expect(result3).toBeFalsy();

    const result4: boolean = isFlanked("abc", "(", ")");
    expect(result4).toBeFalsy();
});

test("able to remove parantheses", () => {
    const result1: string = removeFlank("(abc)", "(", ")");
    expect(result1).toBe("abc");

    const result2: string = removeFlank("(abc", "(", ")");
    expect(result2).toBe("(abc");

    const result3: string = removeFlank("abc)", "(", ")");
    expect(result3).toBe("abc)");

    const result4: string = removeFlank("abc", "(", ")");
    expect(result4).toBe("abc");
});

test("able to double quote", () => {
    const result1: string = doubleQuote("System.out.println(\"Hello world\");");
    expect(result1).toBe("\"System.out.println(\\\"Hello world\\\");\"");
});
