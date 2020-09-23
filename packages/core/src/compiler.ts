import { Insns, Nodes } from "./types";
import transform, { Transformer } from "./transform";

const compilerTransformer: Transformer<Insns.All[]> = {
  add: ({ left, right }) => right.concat(left).concat({ kind: "add" }),
  assign: ({ name, value }) => value.concat(name, { kind: "assign" }),
  call: ({ name, args }) => args.reverse().flat().concat(args.length, name, { kind: "call" }),
  define: ({ name, paramList, stmtList }) => {
    let insns: Insns.All[] = [stmtList];
    insns = insns.concat(paramList.params.reverse().map((param) => param.name));
    return insns.concat(paramList.params.length, name, { kind: "define" });
  },
  divide: ({ left, right }) => right.concat(left).concat({ kind: "divide" }),
  exponentiate: ({ left, right }) => right.concat(left).concat({ kind: "exponentiate" }),
  modulo: ({ left, right }) => right.concat(left).concat({ kind: "modulo" }),
  multiply: ({ left, right }) => right.concat(left).concat({ kind: "multiply" }),
  negate: ({ value }) => value.concat({ kind: "negate" }),
  number: ({ value }) => [value],
  program: ({ stmtList }) => stmtList,
  stmtList: ({ stmts }) => stmts.flat(),
  subtract: ({ left, right }) => right.concat(left).concat({ kind: "subtract" }),
  variable: ({ name }) => [name, { kind: "variable" }]
};

const compiler = (node: Nodes.All): Insns.All[] => transform(node, compilerTransformer);

export default compiler;
