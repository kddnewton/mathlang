import { Nodes } from "./types";
import { call, define, number, optAdd, optSub, optMul, optDiv, optExp, program, setLocal, stmtList } from "./builders";

const isOptimizable = (left: Nodes.Expr, right: Nodes.Expr) => (
  left.type === "number" && right.type === "number"
);

const optimizer = (node: Nodes.All): Nodes.All => {
  switch (node.type) {
    case "call":
      return call(node.name, node.args.map(optimizer) as Nodes.Expr[]);
    case "define":
      return define(node.name, node.paramList, optimizer(node.stmtList) as Nodes.StmtList);
    case "program":
      return program(optimizer(node.stmtList) as Nodes.StmtList);
    case "setLocal":
      return setLocal(node.name, optimizer(node.value) as Nodes.Expr);
    case "stmtList":
      return stmtList(node.stmts.map(optimizer) as Nodes.Stmt[]);
    case "optAdd": {
      const optLeft = optimizer(node.left) as Nodes.Expr;
      const optRight = optimizer(node.right) as Nodes.Expr;

      if (isOptimizable(optLeft, optRight)) {
        return number((node.left as Nodes.Number).value + (node.right as Nodes.Number).value);
      }
      return optAdd(optLeft, optRight);
    }
    case "optSub":{
      const optLeft = optimizer(node.left) as Nodes.Expr;
      const optRight = optimizer(node.right) as Nodes.Expr;

      if (isOptimizable(optLeft, optRight)) {
        return number((node.left as Nodes.Number).value - (node.right as Nodes.Number).value);
      }
      return optSub(optLeft, optRight);
    }
    case "optMul":{
      const optLeft = optimizer(node.left) as Nodes.Expr;
      const optRight = optimizer(node.right) as Nodes.Expr;

      if (isOptimizable(optLeft, optRight)) {
        return number((node.left as Nodes.Number).value * (node.right as Nodes.Number).value);
      }
      return optMul(optLeft, optRight);
    }
    case "optDiv":{
      const optLeft = optimizer(node.left) as Nodes.Expr;
      const optRight = optimizer(node.right) as Nodes.Expr;

      if (isOptimizable(optLeft, optRight)) {
        return number((node.left as Nodes.Number).value / (node.right as Nodes.Number).value);
      }
      return optDiv(optLeft, optRight);
    }
    case "optExp":{
      const optLeft = optimizer(node.left) as Nodes.Expr;
      const optRight = optimizer(node.right) as Nodes.Expr;

      if (isOptimizable(optLeft, optRight)) {
        return number(Math.pow((node.left as Nodes.Number).value, (node.right as Nodes.Number).value));
      }
      return optExp(optLeft, optRight);
    }
    default:
      return node;
  }
};

export default optimizer;
