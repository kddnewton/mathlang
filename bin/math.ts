#!./node_modules/.bin/ts-node

import fs from "fs";
import { evaluate, format, tokenize, typeCheck } from "../src";

const args = process.argv.slice(2);
let command: (source: string) => any = evaluate;

switch (args[0]) {
  case "-f":
  case "--format":
    args.shift();
    command = format;
    break;
  case "-t":
  case "--type-check":
    args.shift();
    command = typeCheck;
    break;
  case "--dump-tokens":
    args.shift();
    command = tokenize;
    break;
}

const source = fs.fstatSync(0).isFIFO() ? 0 : args[0];
const input = fs.readFileSync(source).toString("utf-8");

console.log(command(input));
