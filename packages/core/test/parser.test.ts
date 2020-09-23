import parser from "../src/parser";
import tokenizer from "../src/tokenizer";

describe("parser", () => {
  test("fails if you attempt to redefine a stdlib function", () => {
    const content = `
      f(x) = 2x
      add(x, y) = x + y
    `;

    expect(() => parser(tokenizer(content))).toThrowError("stdlib");
  });
});
