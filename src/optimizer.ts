import { Nodes } from "./types";
import { add, call, define, divide, exponentiate, modulo, multiply, number, program, setLocal, stmtList, subtract } from "./builders";

type Optimizer = Partial<{ [T in Nodes.All["kind"]]: (node: Nodes.All & { kind: T }) => Nodes.All | undefined }>;

const optimize = (node: Nodes.Program, optimizer: Optimizer): Nodes.Program => {
  const optimizeNode = <T extends Nodes.All>(node: Nodes.All): T => {
    const callback = optimizer[node.kind];
    return callback ? ((callback as any)(node) || node) : node;
  };

  const visitNode = <T extends Nodes.All>(node: Nodes.All): T => {
    switch (node.kind) {
      case "add":
        return optimizeNode(add(visitNode(node.left), visitNode(node.right)));
      case "call":
        return optimizeNode(call(node.name, node.args.map((arg) => visitNode(arg))));
      case "define":
        return optimizeNode(define(node.name, node.paramList, visitNode(node.stmtList)));
      case "divide":
        return optimizeNode(divide(visitNode(node.left), visitNode(node.right)));
      case "exponentiate":
        return optimizeNode(exponentiate(visitNode(node.left), visitNode(node.right)));
      case "modulo":
        return optimizeNode(modulo(visitNode(node.left), visitNode(node.right)));
      case "multiply":
        return optimizeNode(multiply(visitNode(node.left), visitNode(node.right)));
      case "program":
        return optimizeNode(program(visitNode(node.stmtList)));
      case "setLocal":
        return optimizeNode(setLocal(node.name, visitNode(node.value)));
      case "stmtList":
        return optimizeNode(stmtList(node.stmts.map(visitNode) as Nodes.Stmt[]));
      case "subtract":
        return optimizeNode(subtract(visitNode(node.left), visitNode(node.right)));
      case "getLocal":
      case "number":
        return node as T;
    }
  }

  return visitNode<Nodes.Program>(node);
};

type ConstantBinaryExpression = Nodes.Node<Nodes.Binary["kind"], {
  left: Nodes.Number,
  right: Nodes.Number,
}>;

function isConstantBinaryExpression(node: Nodes.Binary): node is ConstantBinaryExpression {
  return node.left.kind === "number" && node.right.kind === "number";
}

const replaceConstantBinaryExpressions: Optimizer = {
  add(node: Nodes.Add) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value + node.right.value);
    }
  },
  divide(node: Nodes.Divide) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value / node.right.value);
    }
  },
  exponentiate(node: Nodes.Exponentiate) {
    if (isConstantBinaryExpression(node)) {
      return number(Math.pow(node.left.value, node.right.value));
    }
  },
  modulo(node: Nodes.Modulo) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value % node.right.value);
    }
  },
  multiply(node: Nodes.Multiply) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value * node.right.value);
    }
  },
  subtract(node: Nodes.Subtract) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value - node.right.value);
    }
  }
};

const optimizer = (node: Nodes.Program) => optimize(node, replaceConstantBinaryExpressions);

export default optimizer;
