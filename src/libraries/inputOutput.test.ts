import {print, prompt} from "./inputOutput";

it("able to print", (done) => {
  print("hello", (error, result) => {
    expect(error).toBeNull();
    done();
  });
});
