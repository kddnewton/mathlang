import generator from "./generator";
import evaluator from "./evaluator";

import tokenizer from "./tokenizer";
import parser from "./parser";

const input =
`f(a) {
  a + 1
}
f(2)
`;
const tree = parser(tokenizer(input));

console.log(input);
console.log(evaluator(tree));
console.log(generator(tree));
