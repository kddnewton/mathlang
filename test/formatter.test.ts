import { format } from "../src";

describe("formatter", () => {
  test("makes single-line functions", () => {
    const content = `
      f(x) = {
        2x
      }
    `;

    expect(format(content)).toEqual("f(x) = 2x");
  });
});
