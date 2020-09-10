import compiler from "./compiler";
import generator from "./generator";
import interpreter from "./interpreter";
import parser from "./parser";
import tokenizer from "./tokenizer";

const tree = parser(tokenizer(process.argv[2]));

console.log(generator(tree));
console.log(interpreter(tree));
console.log(compiler(tree));
