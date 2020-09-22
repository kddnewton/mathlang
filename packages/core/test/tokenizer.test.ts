import tokenizer, { isNumber } from "../src/tokenizer";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeNumber(value: number): CustomMatcherResult,
      toBeOfKind(kind: string): CustomMatcherResult,
      toFailTokenization(): CustomMatcherResult
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
  },
  toBeOfKind(received, kind) {
    const token = tokenizer(received)[0];

    return {
      message: () => `Expected: ${kind}\nReceived: ${token.kind}`,
      pass: token.kind === kind
    }
  },
  toFailTokenization(received) {
    let failed = false;

    try {
      tokenizer(received);
    } catch (error) {
      failed = true;
    }

    return {
      message: () => `Expected ${received} to fail tokenization`,
      pass: failed
    };
  }
});

describe("tokenizer", () => {
  describe("number", () => {
    const cases: [string, number][] = [
      ["0b10", 2],
      ["0o10", 8],
      ["0x10", 16],
      ["10", 10],
      ["10.10", 10.1],
      ["10.10e2", 1010],
      ["1,100,100", 1100100]
    ];

    test.each(cases)("%s => %d", (source, value) => {
      expect(source).toBeNumber(value);
    });
  });

  describe("operators", () => {
    const cases = ["+", "-", "*", "/", "%", "^", ",", "=", "{", "}", "(", ")"];

    test.each(cases)("%s", (special) => {
      expect(special).toBeOfKind(special);
    });
  });

  describe("failures", () => {
    test("fails to parse comparison operators", () => {
      expect(">").toFailTokenization();
    });
  });
});
