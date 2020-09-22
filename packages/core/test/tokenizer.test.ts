import tokenizer, { isNumber } from "../src/tokenizer";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeNumber(value: number): CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeNumber(received, value) {
    const token = tokenizer(received)[0];

    if (!isNumber(token)) {
      return {
        message: () => `Expected: Number\nReceived: ${token.kind}`,
        pass: false
      };
    }

    return {
      message: () => `Expected ${value}\nReceived: ${token.value}`,
      pass: token.value === value
    }
  }
});

describe("tokenizer", () => {
  describe("number", () => {
    test("parses binary numbers", () => {
      expect("0b10").toBeNumber(2)
    });

    test("parses octal numbers", () => {
      expect("0o10").toBeNumber(8);
    });

    test("parses hexidecimal numbers", () => {
      expect("0x10").toBeNumber(16);
    });

    test("parses decimal numbers", () => {
      expect("10").toBeNumber(10);
    });

    test("parses decimal numbers with floating point", () => {
      expect("10.10").toBeNumber(10.1);
    });

    test("parses decimal numbers with scientific notification", () => {
      expect("10.10e2").toBeNumber(1010);
    });
  
    test("parses numbers with commas", () => {
      expect("1,100,100").toBeNumber(1100100);
    });
  });

  describe("mapped", () => {
    test("parses correctly", () => {
      const tokens = tokenizer("1-1");

      expect(tokens).toHaveLength(3);
    });
  });
});
