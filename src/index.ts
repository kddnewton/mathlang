import compiler from "./compiler";
import formatter from "./formatter";
import optimizer from "./optimizer";
import parser from "./parser";
import tokenizer from "./tokenizer";
import typeChecker from "./typeChecker";
import { Nodes } from "./types";
import virtualMachine from "./virtualMachine";

type Options = { optimize?: boolean };

const optimizeWithOptions = (node: Nodes.Program, options: Options) => (
  options.optimize ? optimizer(node) : node
);

export const evaluate = (source: string, options: Options = {}) => (
  virtualMachine(compiler(optimizeWithOptions(parser(tokenizer(source)), options)))
);

export const format = (source: string, options: Options = {}) => (
  formatter(optimizeWithOptions(parser(tokenizer(source)), options))
);

export const tokenize = tokenizer;

export const typeCheck = (source: string) => (
  typeChecker(parser(tokenizer(source)))
);
