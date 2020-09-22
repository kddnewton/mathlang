import { Insns, Nodes } from "./types";

const compiler = (node: Nodes.All): Insns.All[] => {
  switch (node.kind) {
    case "add":
      return compiler(node.right).concat(compiler(node.left)).concat({ kind: "add" });
    case "call":
      return node.args.reverse().flatMap(compiler).concat(node.args.length, node.name, { kind: "call" });
    case "define": {
      let insns: Insns.All[] = [compiler(node.stmtList)];
      insns = insns.concat(node.paramList.params.reverse().map((param) => param.name));
      return insns.concat(node.paramList.params.length, node.name, { kind: "define" });
    }
    case "divide":
      return compiler(node.right).concat(compiler(node.left)).concat({ kind: "divide" });
    case "exponentiate":
      return compiler(node.right).concat(compiler(node.left)).concat({ kind: "exponentiate" });
    case "getLocal":
      return [node.name, { kind: "getLocal" }];
    case "modulo":
      return compiler(node.right).concat(compiler(node.left)).concat({ kind: "modulo" });
    case "multiply":
      return compiler(node.right).concat(compiler(node.left)).concat({ kind: "multiply" });
    case "negate":
      return compiler(node.value).concat({ kind: "negate" });
    case "number":
      return [node.value];
    case "program":
      return compiler(node.stmtList);
    case "setLocal":
      return compiler(node.value).concat(node.name, { kind: "setLocal" });
    case "stmtList":
      return node.stmts.flatMap(compiler);
    case "subtract":
      return compiler(node.right).concat(compiler(node.left)).concat({ kind: "subtract" });
  }
};

export default compiler;
