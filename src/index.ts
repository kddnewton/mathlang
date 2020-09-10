import evaluator from "./evaluator";
import generator from "./generator";
import parser from "./parser";
import tokenizer from "./tokenizer";

const input =
`f(a) {
  a + 1
}
a = f(2)
a + 1
`;

const tree = parser(tokenizer(input));
console.log(generator(tree));
console.log(evaluator(tree));
