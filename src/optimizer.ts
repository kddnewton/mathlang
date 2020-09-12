import { Nodes } from "./types";
import { add, call, define, div, exp, mod, mul, number, program, setLocal, stmtList, sub } from "./builders";

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
      case "div":
        return optimizeNode(div(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "exp":
        return optimizeNode(exp(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "mod":
        return optimizeNode(mod(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "mul":
        return optimizeNode(mul(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "program":
        return optimizeNode(program(visitNode(node.stmtList) as Nodes.StmtList));
      case "setLocal":
        return optimizeNode(setLocal(node.name, visitNode(node.value) as Nodes.Expr));
      case "stmtList":
        return optimizeNode(stmtList(node.stmts.map(visitNode) as Nodes.Stmt[]));
      case "sub":
        return optimizeNode(sub(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      default:
        return node;
    }
  }

  return visitNode(node) as Nodes.Program;
};

type PotentialConstantBinaryExpression = Nodes.Add | Nodes.Sub | Nodes.Mul | Nodes.Div | Nodes.Exp | Nodes.Mod;
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
  div(node: Nodes.Div) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value / node.right.value);
    }
  },
  exp(node: Nodes.Exp) {
    if (isConstantBinaryExpression(node)) {
      return number(Math.pow(node.left.value, node.right.value));
    }
  },
  mod(node: Nodes.Mod) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value % node.right.value);
    }
  },
  mul(node: Nodes.Mul) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value * node.right.value);
    }
  },
  sub(node: Nodes.Sub) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value - node.right.value);
    }
  }
};

const optimizer = (node: Nodes.Program) => optimize(node, replaceConstantBinaryExpressions);

export default optimizer;
