import { Nodes } from "./types";

// Output a node to readable code
const formatter = (node: Nodes.All, indent: string = ""): string => {
  switch (node.type) {
    case "number":
      return `${indent}${node.value}`;
    case "getLocal":
      return `${indent}${node.name}`;
    case "setLocal":
      return `${indent}${node.name} = ${formatter(node.value)}`;
    case "call":
      return `${indent}${node.name}(${node.args.map((arg) => formatter(arg)).join(", ")})`;
    case "define":
      const params = node.paramList.params.map((param) => param.name).join(", ");
      return `${node.name}(${params}) {\n${formatter(node.stmtList, `${indent}  `)}\n}`;
    case "program":
      return formatter(node.stmtList);
    case "stmtList":
      return node.stmts.map((stmt) => formatter(stmt, indent)).join("\n");
  }
};

export default formatter;
