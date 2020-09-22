import { Nodes, parse } from "@mathlang/core";

const format = (node: Nodes.All, indent: string = ""): string => {
  switch (node.kind) {
    case "add":
      return `${indent}${format(node.left)} + ${format(node.right)}`;
    case "call":
      return `${indent}${node.name}(${node.args.map((arg) => format(arg)).join(", ")})`;
    case "define": {
      const params = node.paramList.params.map((param) => param.name).join(", ");
      const prefix = `${node.name}(${params}) = `;

      if (node.stmtList.stmts.length === 1) {
        return `${prefix}${format(node.stmtList.stmts[0], indent)}`;
      }

      return `${prefix}{\n${format(node.stmtList, `${indent}  `)}\n}`;
    }
    case "divide":
      return `${indent}${format(node.left)} / ${format(node.right)}`;
    case "exponentiate":
      return `${indent}${format(node.left)}^${format(node.right)}`;
    case "getLocal":
      return `${indent}${node.name}`;
    case "modulo":
      return `${indent}${format(node.left)} % ${format(node.right)}`;
    case "multiply":
      if (node.left.kind === "number" && node.right.kind === "getLocal") {
        return `${indent}${format(node.left)}${format(node.right)}`;
      }

      return `${indent}${format(node.left)} * ${format(node.right)}`;
    case "negate":
      return `${indent}-${format(node.value)}`;
    case "number":
      return `${indent}${node.value}`;
    case "setLocal":
      return `${indent}${node.name} = ${format(node.value)}`;
    case "program":
      return format(node.stmtList);
    case "stmtList":
      return node.stmts.map((stmt) => format(stmt, indent)).join("\n");
    case "subtract":
      return `${indent}${format(node.left)} - ${format(node.right)}`;
  }
};

const formatter = (source: string) => format(parse(source));

export default formatter;
