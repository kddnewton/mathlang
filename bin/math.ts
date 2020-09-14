#!./node_modules/.bin/ts-node

import fs from "fs";
import { evaluate, format, typeCheck, dumpTree } from "../src";

const args = process.argv.slice(2);
let command: (source: string) => any = evaluate;

if (["-f", "--format"].includes(args[0])) {
  args.shift();
  command = format;
} else if (["-t", "--type-check"].includes(args[0])) {
  args.shift();
  command = typeCheck;
} else if (args[0] === "--dump-tree") {
  args.shift();
  command = dumpTree;
}

const source = fs.fstatSync(0).isFIFO() ? 0 : args[0];
const input = fs.readFileSync(source).toString("utf-8");

console.log(command(input));
