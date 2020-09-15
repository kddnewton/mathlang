import { evaluate } from "../src";

describe("operators", () => {
  test("+", () => {
    expect(evaluate("1 + 2")).toEqual(3);
  });

  test("+ multiple", () => {
    expect(evaluate("1 + 2 + 3")).toEqual(6);
  });

  test("-", () => {
    expect(evaluate("3 - 1")).toEqual(2);
  });

  test("*", () => {
    expect(evaluate("3 * 2")).toEqual(6);
  });

  test("* multiple", () => {
    expect(evaluate("1 * 2 * 3")).toEqual(6);
  });

  test("/", () => {
    expect(evaluate("4 / 2")).toEqual(2);
  });

  test("%", () => {
    expect(evaluate("12 % 5")).toEqual(2);
  });

  test("^", () => {
    expect(evaluate("3^2")).toEqual(9);
  });

  test("^ multiple", () => {
    expect(evaluate("2^3^2")).toEqual(512);
  });

  test("precedence", () => {
    expect(evaluate("1 + 2 * 3^4")).toEqual(163);
  });

  test("implicit multiplication", () => {
    const source = `
      x = 2
      3x
    `;

    expect(evaluate(source)).toEqual(6);
  });
});
