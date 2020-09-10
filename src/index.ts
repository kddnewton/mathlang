import compiler from "./compiler";
import generator from "./generator";
import interpreter from "./interpreter";
import machine from "./machine";
import parser from "./parser";
import tokenizer from "./tokenizer";

const tree = parser(tokenizer(process.argv[2]));
const insns = compiler(tree);

console.log(generator(tree));
console.log(interpreter(tree));
console.log(insns);
console.log(machine(insns));
