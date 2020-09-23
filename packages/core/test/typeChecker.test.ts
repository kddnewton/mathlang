import tokenizer from "../src/tokenizer";
import parser from "../src/parser";
import typeChecker from "../src/typeChecker";

describe("typeChecker", () => {
  test("fails expectedly", () => {
    const errors = typeChecker(parser(tokenizer(`
      f(x) = a = 1
      f(2)
    `)));

    expect(errors).toHaveLength(1);
  });
});
