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
    case "div":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "div" });
    case "exp":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "exp" });
    case "getLocal":
      return [node.name, { type: "getLocal" }];
    case "mul":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "mul" });
    case "number":
      return [node.value];
    case "program":
      return compiler(node.stmtList);
    case "setLocal":
      return compiler(node.value).concat(node.name, { type: "setLocal" });
    case "stmtList":
      return node.stmts.flatMap(compiler);
    case "sub":
      return compiler(node.right).concat(compiler(node.left)).concat({ type: "sub" });
  }
};

export default compiler;
