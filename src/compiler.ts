import { Nodes, Insns } from "./types";

const compiler = (node: Nodes.All): Insns.All[] => {
  switch (node.type) {
    case "call": {
      let insns: Insns.All[] = [];
      node.args.forEach((arg) => {
        insns = insns.concat(compiler(arg));
      });

      insns.push(node.args.length, node.name, { type: "call" });
      return insns;
    }
    case "define": {
      let insns: Insns.All[] = [compiler(node.stmtList)];
      insns = insns.concat(node.paramList.params.reverse().map((param) => param.name));

      insns.push(node.name, { type: "define" });
      return insns;
    }
    case "getLocal":
      return [node.name, { type: "getLocal" }];
    case "number":
      return [node.value];
    case "program":
      return compiler(node.stmtList);
    case "setLocal": {
      let insns = compiler(node.value);
      insns.push(node.name, { type: "setLocal" });
      return insns;
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
