#!./node_modules/.bin/ts-node

import fs from "fs";
import { evaluate, format } from "../src";

const args = process.argv.slice(2);
let command: (source: string) => any = evaluate;

if (["-f", "--format"].indexOf(args[0]) > -1) {
  args.shift();
  command = format;
}

const source = fs.fstatSync(0).isFIFO() ? 0 : args[0];
const input = fs.readFileSync(source).toString("utf-8");

console.log(command(input));
