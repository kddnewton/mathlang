#!./node_modules/.bin/ts-node

import fs from "fs";
import { evaluate, format, repl, tokenize, typeCheck } from "../src";

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

const readFile = (source: string | number) => (
  fs.readFileSync(source).toString("utf-8")
);

const commandFile = (source: string | number) => {
  console.log(command(readFile(source)));
};

if (fs.fstatSync(0).isFIFO()) {
  commandFile(0);
} else if (args[0]) {
  commandFile(args[0]);
} else {
  repl();
}
