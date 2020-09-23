import tokenizer from "../src/tokenizer";
import parser from "../src/parser";
import degree from "../src/degree";

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveDegree(value: number): CustomMatcherResult
    }
  }
}

expect.extend({
  toHaveDegree(received, value) {
    const node = parser(tokenizer(received)).stmtList.stmts[0];
    if (node.kind !== "define") {
      return {
        message: () => `Expected: Define\nReceived: ${node.kind}`,
        pass: false
      };
    }

    const nodeDegree = degree(node);
    return {
      message: () => `Expected ${value}\nReceived: ${nodeDegree}`,
      pass: nodeDegree === value
    }
  }
});

describe("degree", () => {
  test("constant", () => {
    expect("f(x) = 0").toHaveDegree(0);
  });

  test("linear", () => {
    expect("f(x) = x + 1").toHaveDegree(1);
  });

  test("quadratic", () => {
    expect("f(x) = 2x^2 + x + 1").toHaveDegree(2);
  });

  test("inverted quadratic", () => {
    expect("f(x) = x^-2").toHaveDegree(2);
  });
});
