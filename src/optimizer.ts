import { Nodes } from "./types";
import { call, define, number, optAdd, optSub, optMul, optDiv, optExp, program, setLocal, stmtList } from "./builders";

const isOptimizable = ({ left, right }: { left: Nodes.Expr, right: Nodes.Expr }) => (
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
    case "optAdd":
      if (isOptimizable(node)) {
        return number((node.left as Nodes.Number).value + (node.right as Nodes.Number).value);
      }
      return optAdd(optimizer(node.left) as Nodes.Expr, optimizer(node.right) as Nodes.Expr);
    case "optSub":
      if (isOptimizable(node)) {
        return number((node.left as Nodes.Number).value - (node.right as Nodes.Number).value);
      }
      return optSub(optimizer(node.left) as Nodes.Expr, optimizer(node.right) as Nodes.Expr);
    case "optMul":
      if (isOptimizable(node)) {
        return number((node.left as Nodes.Number).value * (node.right as Nodes.Number).value);
      }
      return optMul(optimizer(node.left) as Nodes.Expr, optimizer(node.right) as Nodes.Expr);
    case "optDiv":
      if (isOptimizable(node)) {
        return number((node.left as Nodes.Number).value / (node.right as Nodes.Number).value);
      }
      return optDiv(optimizer(node.left) as Nodes.Expr, optimizer(node.right) as Nodes.Expr);
    case "optExp":
      if (isOptimizable(node)) {
        return number(Math.pow((node.left as Nodes.Number).value, (node.right as Nodes.Number).value));
      }
      return optExp(optimizer(node.left) as Nodes.Expr, optimizer(node.right) as Nodes.Expr);
    default:
      return node;
  }
};

export default optimizer;
