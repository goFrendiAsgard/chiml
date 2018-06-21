import {dirname as pathDirName, resolve as pathResolve} from "path";
import {chimlToConfig,
  chimlToYaml,
  doubleQuote,
  isFlanked,
  parseStringArray,
  removeFlank,
  smartSplit} from "./stringUtil";

const chimlSample1 = `
ins: a, b
out: f
do:
  - |(a, b) -> (x, y) => x + y -> c
  - |(a, b) -> (x, y) => x - y -> d
  - do: |(c, d) -> (x, y) => x * y -> e
  - do: |("result: " + e) --> f
`;

const expectedYaml1 = `
ins: a, b
out: f
do:
  - "(a, b) -> (x, y) => x + y -> c"
  - "(a, b) -> (x, y) => x - y -> d"
  - do: "(c, d) -> (x, y) => x * y -> e"
  - do: "(\\\"result: \\\" + e) --> f"
`;

const chimlSample2 =  `|("Hello" + name) --> output`;
const expectedYaml2 = `"(\\\"Hello\\\" + name) --> output"`;

it("able to translate chiml into yaml", (done) => {
  expect(chimlToYaml(chimlSample1)).toBe(expectedYaml1);
  expect(chimlToYaml(chimlSample2)).toBe(expectedYaml2);
  done();
});

it("able to parse string array", (done) => {
  const result = parseStringArray(["1", "abc", "false", "{\"a\": 5}"]);
  expect(result.length).toBe(4);
  expect(result[0]).toBe(1);
  expect(result[1]).toBe("abc");
  expect(result[2]).toBe(false);
  expect(result[3]).toMatchObject({a: 5});
  done();
});

it("able to turn chiml file and chiml script into config", (done) => {
  const rootDirPath = pathDirName(pathDirName(__dirname));
  const testDirPath = pathResolve(rootDirPath, "testcase");
  const p1 = chimlToConfig(pathResolve(testDirPath, "stringUtil", "sample.chiml"));
  const p2 = chimlToConfig(chimlSample1);
  const p3 = chimlToConfig(pathResolve(testDirPath, "compile/test.chiml"));
  Promise.all([p1, p2, p3]).then(([result1, result2, result3]) => {
    expect(Object.keys(result1).length).toBe(3);
    expect(result1).toMatchObject(result2);
    expect(Object.keys(result3).length).toBe(3);
    expect(result3.do.length).toBe(2);
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("able to turn nonexisting chiml file into config", (done) => {
  chimlToConfig("nonexists.chiml").then((result) => {
    expect(result).toBe("nonexists.chiml");
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it("able to turn json-string into json", (done) => {
  const expected = {a: 5, b: 7};
  chimlToConfig(JSON.stringify(expected)).then((result) => {
    expect(result).toMatchObject(expected);
    done();
  }).catch((error) => {
    expect(error).toBeNull();
    done();
  });
});

it ("should fail to parse invalid yaml", (done) => {
  chimlToConfig("key: val\n   misindentKey: otherVal").then((result) => {
    expect(result).toBeUndefined();
    done();
  }).catch((error) => {
    expect(error).toBeDefined();
    done();
  });
});

it("able to smartsplit", (done) => {
  const result1: string[] = smartSplit("'a -> b' -> \"$a->call();\" -> \"c->d\"", "->");
  expect(result1.length).toBe(3);
  expect(result1[0]).toBe("'a -> b'");
  expect(result1[1]).toBe("\"$a->call();\"");
  expect(result1[2]).toBe("\"c->d\"");

  const result2: string[] = smartSplit("a, b, c", "->");
  expect(result2.length).toBe(1);
  expect(result2[0]).toBe("a, b, c");
  done();
});

it("able to recognized flanks", (done) => {
  const result1: boolean = isFlanked("(abc)", "(", ")");
  expect(result1).toBeTruthy();

  const result2: boolean = isFlanked("(abc", "(", ")");
  expect(result2).toBeFalsy();

  const result3: boolean = isFlanked("abc)", "(", ")");
  expect(result3).toBeFalsy();

  const result4: boolean = isFlanked("abc", "(", ")");
  expect(result4).toBeFalsy();

  done();
});

it ("able to remove parantheses", (done) => {
  const result1: string = removeFlank("(abc)", "(", ")");
  expect(result1).toBe("abc");

  const result2: string = removeFlank("(abc", "(", ")");
  expect(result2).toBe("(abc");

  const result3: string = removeFlank("abc)", "(", ")");
  expect(result3).toBe("abc)");

  const result4: string = removeFlank("abc", "(", ")");
  expect(result4).toBe("abc");

  done();
});

it ("able to double quote", (done) => {
  const result1: string = doubleQuote("System.out.println(\"Hello world\");");
  expect(result1).toBe("\"System.out.println(\\\"Hello world\\\");\"");
  done();
});
