import { Nodes } from "./types";
import compiler from "./compiler";
import virtualMachine from "./virtualMachine";

const degree = (define: Nodes.Define): number => {
  if (define.paramList.params.length !== 1) {
    throw new Error("Can only determine the degree of functions with 1 input variable.");
  }

  const input = define.paramList.params[0].name;
  const variables: { [name: string]: number } = { [input]: 1 };

  const getDegree = (node: Nodes.All): number => {
    switch (node.kind) {
      case "exponentiate": {
        const left = getDegree(node.left);
        const right = getDegree(node.right);

        if (!isNaN(left) && right === 0) {
          return left * virtualMachine(compiler(node.right));
        }
        return NaN;
      }
      case "multiply":
        return getDegree(node.left) + getDegree(node.right);
      case "divide":
      case "modulo":
        return getDegree(node.left) - getDegree(node.right);
      case "add":
      case "subtract": {
        const left = getDegree(node.left);
        const right = getDegree(node.right);

        if (isNaN(left) || isNaN(right)) {
          return NaN;
        }
        return Math.abs(left) > Math.abs(right) ? left : right;
      }
      case "negate":
        return getDegree(node.value);
      case "number":
        return 0;
      case "variable":
        return variables[node.name];
      case "assign":
        variables[node.name] = getDegree(node.value);
        return NaN;
      case "stmtList":
        let nodeDegree;
        node.stmts.forEach((stmt) => {
          nodeDegree = getDegree(stmt);
        });
  
        return nodeDegree === undefined || isNaN(nodeDegree) ? NaN : nodeDegree;
      case "call":
      case "define":
      case "program":
        return NaN;
    }
  };

  return Math.abs(getDegree(define.stmtList));
};

export default degree;
