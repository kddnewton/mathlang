import { evaluate } from "../src";

describe("functions", () => {
  test("user-defined", () => {
    const source = `
      double(x) = {
        x * 2
      }
      double(2)
    `;

    expect(evaluate(source)).toEqual(4);
  });

  test("nested scope", () => {
    const source = `
      f(x) = {
        f(x) = {
          f(x) = {
            x * 2
          }
          f(x)
        }
        f(x)
      }
      f(2)
    `;

    expect(evaluate(source)).toEqual(4);
  });
});
