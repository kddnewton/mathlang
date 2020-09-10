import { Nodes } from "./types";

// Output a node to readable pseudo-code
const generator = (node: Nodes.Visitable, indent: string = ""): string => {
  switch (node.type) {
    case "number":
      return `${indent}${node.value}`;
    case "getLocal":
      return `${indent}${node.name}`;
    case "setLocal":
      return `${indent}${node.name} = ${generator(node.value)}`;
    case "call":
      return `${indent}${node.name}(${node.args.map((arg) => generator(arg)).join(", ")})`;
    case "define":
      const params = node.paramList.params.map((param) => param.name).join(", ");
      return `${node.name}(${params}) {\n${generator(node.stmtList, `${indent}  `)}\n}\n`;
    case "program":
      return generator(node.stmtList);
    case "stmtList":
      return node.stmts.map((stmt) => generator(stmt, indent)).join("\n");
  }
};

export default generator;
