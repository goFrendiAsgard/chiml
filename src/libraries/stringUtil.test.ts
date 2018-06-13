import {isFlanked, removeFlank, smartSplit} from "./stringUtil";

it("able to smartsplit", (done) => {
  const result: string[] = smartSplit("'a -> b' -> \"$a->call();\" -> \"c->d\"", "->");
  expect(result[0]).toBe("'a -> b'");
  expect(result[1]).toBe("\"$a->call();\"");
  expect(result[2]).toBe("\"c->d\"");
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
