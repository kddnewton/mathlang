import { Tokens } from "./types";

const operators = ["+", "-", "*", "/", "^"];
const numbers = /[0-9]/;
const letters = /[a-z]/i;

function isOperator(value: string): value is Tokens.Operator["value"] {
  return operators.indexOf(value) > -1;
}

const symbols: { [key: string]: Tokens.Symbol["type"] } = {
  "(": "lparen",
  ")": "rparen",
  "{": "lbrace",
  "}": "rbrace",
  ",": "comma",
  "=": "equals"
};

function isSymbol(char: keyof typeof symbols): char is keyof typeof symbols {
  return Object.prototype.hasOwnProperty.call(symbols, char);
}

const tokenizer = (input: string) => {
  let current = 0;
  const tokens: Tokens.All[] = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "\n") {
      if (!tokens[tokens.length - 1] || tokens[tokens.length - 1].type !== "newline") {
        tokens.push({ type: "newline" });
      }

      current++;
      continue;
    }

    if (/\s/.test(char)) {
      current++;
      continue;
    }

    if (isSymbol(char)) {
      tokens.push({ type: symbols[char] });
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
