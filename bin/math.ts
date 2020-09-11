#!./node_modules/.bin/ts-node

import fs from "fs";
import evaluate from "../src";

const source = fs.fstatSync(0).isFIFO() ? 0 : process.argv[2];
const input = fs.readFileSync(source).toString("utf-8");

console.log(evaluate(input));
