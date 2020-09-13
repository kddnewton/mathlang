import { Nodes } from "./types";
import { add, call, define, divide, exponentiate, modulo, multiply, number, program, setLocal, stmtList, subtract } from "./builders";

type Optimizer = Partial<{ [K in Nodes.All["type"]]: (node: Nodes.All & { type: K }) => Nodes.All | undefined }>;

const optimize = (node: Nodes.Program, optimizer: Optimizer): Nodes.Program => {
  const optimizeNode = (node: Nodes.All): Nodes.All => {
    const callback = optimizer[node.type];
    return callback ? ((callback as any)(node) || node) : node;
  };

  const visitNode = (node: Nodes.All): Nodes.All => {
    switch (node.type) {
      case "add":
        return optimizeNode(add(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "call":
        return optimizeNode(call(node.name, node.args.map(visitNode) as Nodes.Expr[]));
      case "define":
        return optimizeNode(define(node.name, node.paramList, visitNode(node.stmtList) as Nodes.StmtList));
      case "divide":
        return optimizeNode(divide(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "exponentiate":
        return optimizeNode(exponentiate(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "modulo":
        return optimizeNode(modulo(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "multiply":
        return optimizeNode(multiply(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "program":
        return optimizeNode(program(visitNode(node.stmtList) as Nodes.StmtList));
      case "setLocal":
        return optimizeNode(setLocal(node.name, visitNode(node.value) as Nodes.Expr));
      case "stmtList":
        return optimizeNode(stmtList(node.stmts.map(visitNode) as Nodes.Stmt[]));
      case "subtract":
        return optimizeNode(subtract(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      default:
        return node;
    }
  }

  return visitNode(node) as Nodes.Program;
};

type PotentialConstantBinaryExpression = Nodes.Add | Nodes.Subtract | Nodes.Multiply | Nodes.Divide | Nodes.Exponentiate | Nodes.Modulo;
type ConstantBinaryExpression = {
  type: PotentialConstantBinaryExpression["type"],
  left: Nodes.Number,
  right: Nodes.Number
};

function isConstantBinaryExpression(node: PotentialConstantBinaryExpression): node is ConstantBinaryExpression {
  return node.left.type === "number" && node.right.type === "number";
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
