import { evaluate } from "../src";

describe("stdlib", () => {
  test("neg", () => {
    expect(evaluate("neg(1)")).toEqual(-1);
  });

  test("add", () => {
    expect(evaluate("add(1, 2)")).toEqual(3);
  });

  test("sub", () => {
    expect(evaluate("sub(3, 1)")).toEqual(2);
  });

  test("mul", () => {
    expect(evaluate("mul(3, 2)")).toEqual(6);
  });

  test("div", () => {
    expect(evaluate("div(4, 2)")).toEqual(2);
  });

  test("exp", () => {
    expect(evaluate("exp(3, 2)")).toEqual(9);
  });

  test("log", () => {
    expect(evaluate("log(100)")).toEqual(2);
  });

  test("ln", () => {
    expect(evaluate(`ln(100)`)).toBeCloseTo(4.61);
  });

  test("sqrt", () => {
    expect(evaluate("sqrt(9)")).toEqual(3);
  });
});
