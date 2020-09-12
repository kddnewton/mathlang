import { Nodes } from "./types";

// Output a node to readable code
const formatter = (node: Nodes.All, indent: string = ""): string => {
  switch (node.type) {
    case "add":
      return `${indent}${formatter(node.left)} + ${formatter(node.right)}`;
    case "call":
      return `${indent}${node.name}(${node.args.map((arg) => formatter(arg)).join(", ")})`;
    case "define":
      const params = node.paramList.params.map((param) => param.name).join(", ");
      return `${node.name}(${params}) {\n${formatter(node.stmtList, `${indent}  `)}\n}`;
    case "div":
      return `${indent}${formatter(node.left)} / ${formatter(node.right)}`;
    case "exp":
      return `${indent}${formatter(node.left)}^${formatter(node.right)}`;
    case "getLocal":
      return `${indent}${node.name}`;
    case "mul":
      return `${indent}${formatter(node.left)} * ${formatter(node.right)}`;
    case "number":
      return `${indent}${node.value}`;
    case "setLocal":
      return `${indent}${node.name} = ${formatter(node.value)}`;
    case "program":
      return formatter(node.stmtList);
    case "stmtList":
      return node.stmts.map((stmt) => formatter(stmt, indent)).join("\n");
    case "sub":
      return `${indent}${formatter(node.left)} - ${formatter(node.right)}`;
  }
};

export default formatter;
