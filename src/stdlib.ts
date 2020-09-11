const stdlib = {
  neg: (value: number) => value * -1,
  add: (left: number, right: number) => left + right,
  sub: (left: number, right: number) => left - right,
  mul: (left: number, right: number) => left * right,
  div: (left: number, right: number) => {
    if (right === 0) {
      throw new Error("Division by 0");
    }
    return left / right;
  },
  exp: (value: number, power: number) => Math.pow(value, power),
  log: (value: number) => Math.log10(value),
  ln: (value: number) => Math.log(value)
};

export function isStdLibFunc(key: string): key is keyof typeof stdlib {
  return key in stdlib;
}

export default stdlib;
