import { Nodes } from "./types";

// Output a node to readable code
const formatter = (node: Nodes.All, indent: string = ""): string => {
  switch (node.type) {
    case "add":
      return `${indent}${formatter(node.left)} + ${formatter(node.right)}`;
    case "call":
      return `${indent}${node.name}(${node.args.map((arg) => formatter(arg)).join(", ")})`;
    case "define": {
      const params = node.paramList.params.map((param) => param.name).join(", ");
      const prefix = `${node.name}(${params}) = `;

      if (node.stmtList.stmts.length === 1) {
        return `${prefix}${formatter(node.stmtList.stmts[0], indent)}`;
      }

      return `${prefix}{\n${formatter(node.stmtList, `${indent}  `)}\n}`;
    }
    case "divide":
      return `${indent}${formatter(node.left)} / ${formatter(node.right)}`;
    case "exponentiate":
      return `${indent}${formatter(node.left)}^${formatter(node.right)}`;
    case "getLocal":
      return `${indent}${node.name}`;
    case "modulo":
      return `${indent}${formatter(node.left)} % ${formatter(node.right)}`;
    case "multiply":
      if (node.left.type === "number" && node.right.type === "getLocal") {
        return `${indent}${formatter(node.left)}${formatter(node.right)}`;
      }

      return `${indent}${formatter(node.left)} * ${formatter(node.right)}`;
    case "number":
      return `${indent}${node.value}`;
    case "setLocal":
      return `${indent}${node.name} = ${formatter(node.value)}`;
    case "program":
      return formatter(node.stmtList);
    case "stmtList":
      return node.stmts.map((stmt) => formatter(stmt, indent)).join("\n");
    case "subtract":
      return `${indent}${formatter(node.left)} - ${formatter(node.right)}`;
  }
};

export default formatter;
