import { evaluate } from "../src";

describe("stdlib", () => {
  test("negate", () => {
    expect(evaluate("negate(1)")).toEqual(-1);
  });

  test("add", () => {
    expect(evaluate("add(1, 2)")).toEqual(3);
  });

  test("subtract", () => {
    expect(evaluate("subtract(3, 1)")).toEqual(2);
  });

  test("multiply", () => {
    expect(evaluate("multiply(3, 2)")).toEqual(6);
  });

  test("divide", () => {
    expect(evaluate("divide(4, 2)")).toEqual(2);
  });

  test("exponentiate", () => {
    expect(evaluate("exponentiate(3, 2)")).toEqual(9);
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

  test("modulo", () => {
    expect(evaluate("modulo(12, 5)")).toEqual(2);
  });
});
