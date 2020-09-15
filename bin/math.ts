#!./node_modules/.bin/ts-node

import fs from "fs";
import { evaluate, tokenize, typeCheck } from "../packages/mathlang";
import repl from "../packages/repl";
import format from "../packages/format";

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

const commandFile = (handle: string | number) => {
  const source = fs.readFileSync(handle).toString("utf-8");
  console.log(command(source));
};

if (fs.fstatSync(0).isFIFO()) {
  commandFile(0);
} else if (args[0]) {
  commandFile(args[0]);
} else {
  repl();
}
