import { parse, Nodes } from "@mathlang/core";
import prettier, { Doc, FastPath, Options, ParserOptions, Plugin } from "prettier";

const { concat, group, hardline, indent, join, line, softline } = prettier.doc.builders;
const operationPrecedence = {
  negate: 2,
  exponentiate: 2,
  multiply: 1,
  divide: 1,
  modulo: 1,
  add: 0,
  subtract: 0
};

const isOperation = (kind: Nodes.All["kind"]): kind is keyof typeof operationPrecedence => (
  Object.prototype.hasOwnProperty.call(operationPrecedence, kind)
);

const makePrintBinary = (operator: string, precedence: number) => (path: FastPath<Nodes.All>, print: (path: FastPath<Nodes.All>) => Doc): Doc => {
  const parts = [
    path.call(print, "left"),
    operator,
    path.call(print, "right")
  ];

  const parentNode = path.getParentNode();
  if (parentNode && isOperation(parentNode.kind) && operationPrecedence[parentNode.kind] > precedence) {
    return concat(["(", ...parts, ")"]);
  }

  return concat(parts);
};

const printAdd = makePrintBinary(" + ", operationPrecedence.add);
const printSubtract = makePrintBinary(" - ", operationPrecedence.subtract);

const printMultiply = makePrintBinary(" * ", operationPrecedence.multiply);
const printDivide = makePrintBinary(" / ", operationPrecedence.divide);
const printModulo = makePrintBinary(" % ", operationPrecedence.modulo);

const printExponentiate = makePrintBinary("^", operationPrecedence.exponentiate);

const printNode = (path: FastPath<Nodes.All>, options: ParserOptions, print: (path: FastPath<Nodes.All>) => Doc): Doc => {
  const node = path.getValue();

  switch (node.kind) {
    case "add":
      return printAdd(path, print);
    case "call":
      return group(concat([
        node.name, "(",
        indent(concat([softline, join(concat([",", line]), path.map(print, "args"))])),
        softline, ")"
      ]));
    case "define": {
      const params = node.paramList.params.map((param) => param.name).join(", ");
      const prefix = `${node.name}(${params})`;

      if (node.stmtList.stmts.length === 1) {
        return concat([prefix, " = ", path.call(print, "stmtList", 0)]);
      }

      return group(concat([
        prefix, " = {",
        concat([hardline, join(hardline, path.map(print, "stmtList"))]),
        hardline,
        "}"
      ]));
    }
    case "divide":
      return printDivide(path, print);
    case "exponentiate":
      return printExponentiate(path, print);
    case "getLocal":
      return node.name;
    case "modulo":
      return printModulo(path, print);
    case "multiply":
      if (node.left.kind === "number" && node.right.kind === "getLocal") {
        return concat([path.call(print, "left"), path.call(print, "right")]);
      }
      return printMultiply(path, print);
    case "negate":
      return concat(["-", path.call(print, "value")]);
    case "number":
      return node.source || node.value.toString();
    case "setLocal":
      return concat([node.name, " = ", path.call(print, "value")]);
    case "program":
      return path.call(print, "stmtList");
    case "stmtList":
      return join(hardline, path.map(print, "stmts"));
    case "subtract":
      return printSubtract(path, print);
  }
}

const plugin: Plugin = {
  languages: [
    {
      name: "Math",
      parsers: ["math"],
      extensions: [".math"]
    }
  ],
  parsers: {
    math: {
      parse,
      astFormat: "math",
      locStart: (node: Nodes.All) => 0,
      locEnd: (node: Nodes.All) => 0
    }
  },
  printers: {
    math: {
      print: printNode
    }
  },
  defaultOptions: {
    printWidth: 80,
    tabWidth: 2
  }
};

export default plugin;

// Gotta cast to any first because the prettier types don't allow custom parsers
// to be passed by name
const options = { parser: "math", plugins: [plugin] } as any as Options;
export const format = (source: string) => prettier.format(source, options);
