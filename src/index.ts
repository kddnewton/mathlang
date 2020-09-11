import compiler from "./compiler";
import formatter from "./formatter";
import interpreter from "./interpreter";
import machine from "./machine";
import parser from "./parser";
import tokenizer from "./tokenizer";

export const evaluate = (source: string) => (
  machine(compiler(parser(tokenizer(source))))
);

export const format = (source: string) => (
  formatter(parser(tokenizer(source)))
);
