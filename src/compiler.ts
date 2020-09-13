import { Insns, Nodes } from "./types";

const compiler = (node: Nodes.All): Insns.All[] => {
  switch (node.type) {
    case "add":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "add" });
    case "call":
      return node.args.reverse().flatMap(compiler).concat(node.args.length, node.name, { type: "call" });
    case "define": {
      let insns: Insns.All[] = [compiler(node.stmtList)];
      insns = insns.concat(node.paramList.params.reverse().map((param) => param.name));
      return insns.concat(node.paramList.params.length, node.name, { type: "define" });
    }
    case "divide":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "divide" });
    case "exponentiate":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "exponentiate" });
    case "getLocal":
      return [node.name, { type: "getLocal" }];
    case "modulo":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "modulo" });
    case "multiply":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "multiply" });
    case "number":
      return [node.value];
    case "program":
      return compiler(node.stmtList);
    case "setLocal":
      return compiler(node.value).concat(node.name, { type: "setLocal" });
    case "stmtList":
      return node.stmts.flatMap(compiler);
    case "subtract":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "subtract" });
  }
};

export default compiler;
