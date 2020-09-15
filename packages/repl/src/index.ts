import fs from "fs";
import readline from "readline";
import path from "path";

import { evaluate } from "mathlang";

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

export default repl;
