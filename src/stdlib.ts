const stdlib = {
  add: (left: number, right: number) => left + right,
  divide: (left: number, right: number) => {
    if (right === 0) {
      throw new Error("Division by 0");
    }
    return left / right;
  },
  exponentiate: (value: number, power: number) => Math.pow(value, power),
  ln: (value: number) => Math.log(value),
  log: (value: number) => Math.log10(value),
  modulo: (left: number, right: number) => left % right,
  multiply: (left: number, right: number) => left * right,
  negate: (value: number) => value * -1,
  print: (value: number) => {
    console.log(value);
    return value;
  },
  sqrt: (value: number) => Math.sqrt(value),
  subtract: (left: number, right: number) => left - right
};

export function isStdLib(key: string): key is keyof typeof stdlib {
  return key in stdlib;
}

export default stdlib;
