import generator from "./generator";
import evaluator from "./evaluator";

import tokenizer from "./tokenizer";
import parser from "./parser";

const input =
  `a = 3 + 2^3 * 3
  a + 3`;
const tree = parser(tokenizer(input));

console.log(input);
console.log(evaluator(tree));
console.log(generator(tree));
