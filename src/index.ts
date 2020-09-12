import compiler from "./compiler";
import formatter from "./formatter";
import interpreter from "./interpreter";
import machine from "./machine";
import optimizer from "./optimizer";
import parser from "./parser";
import tokenizer from "./tokenizer";

export const evaluate = (source: string) => (
  machine(compiler(optimizer(parser(tokenizer(source)))))
);

export const format = (source: string, { optimize }: { optimize?: boolean } = {}) => {
  let node = parser(tokenizer(source));
  if (optimize) {
    node = optimizer(node)
  }

  return formatter(node);
};
