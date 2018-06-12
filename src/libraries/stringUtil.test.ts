import {removeParantheses, smartSplit} from "./stringUtil";

it("able to smartsplit", (done) => {
  const result: string[] = smartSplit("'a -> b' -> \"$a->call();\" -> \"c->d\"", "->");
  expect(result[0]).toBe("'a -> b'");
  expect(result[1]).toBe("\"$a->call();\"");
  expect(result[2]).toBe("\"c->d\"");
  done();
});

it ("able to remove parantheses", (done) => {
  const result1: string = removeParantheses("(abc)");
  expect(result1).toBe("abc");

  const result2: string = removeParantheses("(abc");
  expect(result2).toBe("(abc");

  const result3: string = removeParantheses("abc)");
  expect(result3).toBe("abc)");

  done();
});
