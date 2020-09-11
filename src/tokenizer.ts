import { Tokens } from "./types";

const numbers = /[0-9]/;
const letters = /[a-z]/i;
const mapped: { [key: string]: (Tokens.Symbol | Tokens.Operator)["type"] } = {
  "(": "lparen",
  ")": "rparen",
  "{": "lbrace",
  "}": "rbrace",
  ",": "comma",
  "=": "equals",
  "+": "plus",
  "-": "minus",
  "*": "times",
  "/": "over",
  "^": "tothe"
};

function isMapped(char: keyof typeof mapped): char is keyof typeof mapped {
  return Object.prototype.hasOwnProperty.call(mapped, char);
}

const tokenizer = (source: string) => {
  const input = source.trim();

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

    if (isMapped(char)) {
      tokens.push({ type: mapped[char] });
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
