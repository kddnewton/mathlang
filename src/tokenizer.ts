import { Tokens } from "./types";

const symbols = ["(", ")", "{", "}", ",", "="];
const operators = ["+", "-", "*", "/", "^"];

const numbers = /[0-9]/;
const letters = /[a-z]/i;

function isSymbol(value: string): value is Tokens.Symbol["value"] {
  return symbols.indexOf(value) > -1;
}

function isOperator(value: string): value is Tokens.Operator["value"] {
  return operators.indexOf(value) > -1;
}

const tokenizer = (input: string) => {
  let current = 0;
  const tokens: Tokens.All[] = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "\n") {
      tokens.push({ type: "newline" });
      current++;
      continue;
    }

    if (/\s/.test(char)) {
      current++;
      continue;
    }

    if (isSymbol(char)) {
      tokens.push({ type: "symbol", value: char });
      current++;
      continue;
    }

    if (isOperator(char)) {
      tokens.push({ type: "operator", value: char });
      current++;
      continue;
    }

    if (numbers.test(char)) {
      let chars = "";

      while (numbers.test(char)) {
        chars += char;
        char = input[++current];
      }

      tokens.push({ type: "number", value: parseInt(chars, 10) });
      continue;
    }

    if (letters.test(char)) {
      let chars = "";

      while (letters.test(char)) {
        chars += char;
        char = input[++current];
      }

      tokens.push({ type: "name", value: chars });
      continue;
    }

    throw new TypeError(`Unable to parse: ${char}`);
  }

  return tokens;
};

export default tokenizer;
