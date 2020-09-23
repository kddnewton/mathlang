import tokenizer from "../src/tokenizer";
import parser from "../src/parser";
import optimizer from "../src/optimizer";

declare global {
  namespace jest {
    interface Matchers<R> {
      toOptimizeTo(value: number): CustomMatcherResult
    }
  }
}

expect.extend({
  toOptimizeTo(received, value) {
    const optimized = optimizer(parser(tokenizer(received)).stmtList.stmts[0]);

    if (optimized.kind !== "number") {
      return {
        message: () => `Expected: number\nReceived: ${optimized.kind}`,
        pass: false
      };
    }

    return {
      message: () => `Expected: ${value}\nReceived: ${optimized.value}`,
      pass: value === optimized.value
    };
  }
});

describe("optimizer", () => {
  test("add", () => {
    expect("1 + 2").toOptimizeTo(3);
  });

  test("subtract", () => {
    expect("3 - 2").toOptimizeTo(1);
  });

  test("multiply", () => {
    expect("2 * 3").toOptimizeTo(6);
  });

  test("divide", () => {
    expect("6 / 3").toOptimizeTo(2);
  });

  test("exponentiate", () => {
    expect("2^3").toOptimizeTo(8);
  });

  test("negate", () => {
    expect("-(1 + 2)").toOptimizeTo(-3);
  });
});
