import fs from "fs";
import readline from "readline";

import compiler from "./compiler";
import parser from "./parser";
import tokenizer from "./tokenizer";
import virtualMachine from "./virtualMachine";

const repl = () => {
  const { version } = JSON.parse(fs.readFileSync("package.json").toString("utf-8"));
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
      console.log(virtualMachine(compiler(parser(tokenizer(source)))));
      prompt();
    });
  };

  prompt();
};

export default repl;
