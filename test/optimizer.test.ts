import { format } from "../src";

describe("optimizer", () => {
  test("add", () => {
    expect(format("1 + 2", { optimize: true })).toEqual("3");
  });

  test("sub", () => {
    expect(format("2 - 1", { optimize: true })).toEqual("1");
  });

  test("mul", () => {
    expect(format("2 * 3", { optimize: true })).toEqual("6");
  });

  test("div", () => {
    expect(format("4 / 2", { optimize: true })).toEqual("2");
  });

  test("exp", () => {
    expect(format("5^2", { optimize: true })).toEqual("25");
  });

  test("mod", () => {
    expect(format("12 % 5", { optimize: true })).toEqual("2");
  });
});
