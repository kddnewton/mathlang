import { Nodes } from "./types";
import { call, define, number, optAdd, optSub, optMul, optDiv, optExp, program, setLocal, stmtList } from "./builders";

type Visitor = Partial<{ [K in Nodes.All["type"]]: (node: Nodes.All & { type: K }) => Nodes.All | undefined }>;

const visit = (node: Nodes.Program, visitor: Visitor): Nodes.Program => {
  const visitNextNode = (node: Nodes.All): Nodes.All => {
    const callback = visitor[node.type];
    return callback ? ((callback as any)(node) || node) : node;
  };

  const visitNode = (node: Nodes.All): Nodes.All => {
    switch (node.type) {
      case "call":
        return visitNextNode(call(node.name, node.args.map(visitNode) as Nodes.Expr[]));
      case "define":
        return visitNextNode(define(node.name, node.paramList, visitNode(node.stmtList) as Nodes.StmtList));
      case "optAdd":
        return visitNextNode(optAdd(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "optSub":
        return visitNextNode(optSub(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "optMul":
        return visitNextNode(optMul(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "optDiv":
        return visitNextNode(optDiv(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "optExp":
        return visitNextNode(optExp(visitNode(node.left) as Nodes.Expr, visitNode(node.right) as Nodes.Expr));
      case "program":
        return visitNextNode(program(visitNode(node.stmtList) as Nodes.StmtList));
      case "setLocal":
        return visitNextNode(setLocal(node.name, visitNode(node.value) as Nodes.Expr));
      case "stmtList":
        return visitNextNode(stmtList(node.stmts.map(visitNode) as Nodes.Stmt[]));
      default:
        return node;
    }
  }

  return visitNode(node) as Nodes.Program;
};

type PotentialConstantBinaryExpression = Nodes.OptAdd | Nodes.OptSub | Nodes.OptMul | Nodes.OptDiv | Nodes.OptExp;
type ConstantBinaryExpression = {
  type: PotentialConstantBinaryExpression["type"],
  left: Nodes.Number,
  right: Nodes.Number
};

function isConstantBinaryExpression(node: PotentialConstantBinaryExpression): node is ConstantBinaryExpression {
  return node.left.type === "number" && node.right.type === "number";
}

const replaceConstantExpressions: Visitor = {
  optAdd(node: Nodes.OptAdd) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value + node.right.value)
    }
  },
  optSub(node: Nodes.OptSub) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value - node.right.value);
    }
  },
  optMul(node: Nodes.OptMul) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value * node.right.value);
    }
  },
  optDiv(node: Nodes.OptDiv) {
    if (isConstantBinaryExpression(node)) {
      return number(node.left.value / node.right.value);
    }
  },
  optExp(node: Nodes.OptExp) {
    if (isConstantBinaryExpression(node)) {
      return number(Math.pow(node.left.value, node.right.value));
    }
  }
};

const optimizer = (node: Nodes.Program) => visit(node, replaceConstantExpressions);

export default optimizer;
