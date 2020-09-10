import { Nodes, Insns } from "./types";

const compiler = (node: Nodes.All): Insns.All => {
  switch (node.type) {
    case "call": {
      let insns: Insns.All[] = [{ type: "call" }, node.name, node.args.length];
      node.args.forEach((arg) => {
        insns = insns.concat(compiler(arg));
      });

      return insns;
    }
    case "define": {
      let insns: Insns.All[] = [{ type: "define" }, node.name, node.paramList.params.length];

      insns = insns.concat(node.paramList.params.map((param) => param.name));
      insns.push(compiler(node.stmtList));

      return insns;
    }
    case "getLocal":
      return [{ type: "getLocal" }, node.name];
    case "number":
      return node.value;
    case "program":
      return compiler(node.stmtList);
    case "setLocal": {
      const insns: Insns.All[] = [{ type: "setLocal" }, node.name];
      return insns.concat(compiler(node.value));
    }
    case "stmtList": {
      let insns: Insns.All[] = [];
      node.stmts.forEach((stmt) => {
        insns = insns.concat(compiler(stmt));
      });

      return insns;
    }
  }
};

export default compiler;
