import compiler from "./compiler";
import generator from "./generator";
import interpreter from "./interpreter";
import machine from "./machine";
import parser from "./parser";
import tokenizer from "./tokenizer";

const evaluate = (source: string) => machine(compiler(parser(tokenizer(source))));

export default evaluate;
