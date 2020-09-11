import { evaluate } from "../src";

describe("operators", () => {
  test("+", () => {
    expect(evaluate("1 + 2")).toEqual(3);
  });

  test("-", () => {
    expect(evaluate("3 - 1")).toEqual(2);
  });

  test("*", () => {
    expect(evaluate("3 * 2")).toEqual(6);
  });

  test("/", () => {
    expect(evaluate("4 / 2")).toEqual(2);
  });

  test("^", () => {
    expect(evaluate("3^2")).toEqual(9);
  });

  test("precedence", () => {
    expect(evaluate("1 + 2 * 3^4")).toEqual(163);
  });
});
