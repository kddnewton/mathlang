const stdlib = {
  add: (left: number, right: number) => left + right,
  div: (left: number, right: number) => {
    if (right === 0) {
      throw new Error("Division by 0");
    }
    return left / right;
  },
  exp: (value: number, power: number) => Math.pow(value, power),
  ln: (value: number) => Math.log(value),
  log: (value: number) => Math.log10(value),
  mul: (left: number, right: number) => left * right,
  neg: (value: number) => value * -1,
  print: (value: number) => {
    console.log(value);
    return value;
  },
  sqrt: (value: number) => Math.sqrt(value),
  sub: (left: number, right: number) => left - right
};

export function isStdLib(key: string): key is keyof typeof stdlib {
  return key in stdlib;
}

export default stdlib;
