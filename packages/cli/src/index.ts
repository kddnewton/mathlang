import fs from "fs";
import readline from "readline";
import path from "path";

import { evaluate, tokenize, typeCheck } from "@mathlang/core";
import format from "@mathlang/format";

const readFile = (handle: string | number) => (
  fs.readFileSync(handle).toString("utf-8")
);

const repl = () => {
  const packagePath = path.join(__dirname, "../package.json");
  const { version } = JSON.parse(fs.readFileSync(packagePath).toString("utf-8"));
 
  console.log(`Welcome to mathlang v${version}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  process.on("SIGINT", () => {
    rl.close();
  });

  const prompt = () => {
    rl.question("> ", (source) => {
      console.log(evaluate(source));
      prompt();
    });
  };

  prompt();
};

const cli = (args: string[]) => {
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

  if (fs.fstatSync(0).isFIFO()) {
    console.log(command(readFile(0)));
  } else if (args[0]) {
    console.log(command(readFile(args[0])));
  } else {
    repl();
  }
};

export default cli;
