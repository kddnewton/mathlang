import evaluator from "./evaluator";
import generator from "./generator";
import parser from "./parser";
import tokenizer from "./tokenizer";

const tree = parser(tokenizer(process.argv[2]));

console.log(generator(tree));
console.log(evaluator(tree));
