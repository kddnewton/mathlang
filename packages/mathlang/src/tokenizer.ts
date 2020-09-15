import { Tokens } from "./types";

const mapped: { [key: string]: (Tokens.Symbol | Tokens.Operator)["kind"] } = {
  ",": "comma",
  "=": "equals",
  "{": "lbrace",
  "(": "lparen",
  "-": "minus",
  "%": "mod",
  "/": "over",
  "+": "plus",
  "}": "rbrace",
  ")": "rparen",
  "*": "times",
  "^": "tothe"
};

const pieces = {
  newline: "\\n+",
  whitespace: "\\s+",
  mapped: `[${Object.keys(mapped).join("").replace("-", "\\-")}]`,
  number: "[1-9][0-9]*",
  name: "[a-z][0-9a-zA-Z]*"
};

const patterns = Object.keys(pieces).map((key) => (
  `(?<${key}>${pieces[key as keyof typeof pieces]})`
));

const pattern = new RegExp(`(${patterns.join("|")})`, "g");

const tokenizer = (input: string) => {
  const source = input.trim();
  const tokens: Tokens.All[] = [];

  const matches = source.matchAll(pattern);
  const loc = { pos: 0, line: 0, col: 0 };

  for (const match of matches) {
    if (match.index === undefined || match.index > loc.pos) {
      throw new TypeError(`Unable to parse: ${source[loc.pos]}`);
    }

    const groups = match.groups || {};

    if (groups.newline) {
      tokens.push({ kind: "newline", loc: { ...loc } });
      loc.line += groups.newline.length;
    } else if (groups.whitespace) {
      // skip straight over whitespace
    } else if (groups.mapped) {
      tokens.push({ kind: mapped[groups.mapped], loc: { ...loc } });
    } else if (groups.number) {
      tokens.push({ kind: "number", value: parseInt(groups.number, 10), loc: { ...loc } });
    } else if (groups.name) {
      tokens.push({ kind: "name", value: groups.name, loc: { ...loc } });
    }

    loc.pos = match.index + match[0].length;
    loc.col = groups.newline ? 0 : (loc.col + match[0].length);
  }

  if (loc.pos < source.length) {
    throw new TypeError(`Unable to parse: ${source[loc.pos]}`);
  }

  return tokens;
};

export default tokenizer;
