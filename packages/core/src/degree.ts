import { Nodes } from "./types";
import compiler from "./compiler";
import virtualMachine from "./virtualMachine";

import transform, { Transformer } from "./transform";

const degree = (define: Nodes.Define): number => {
  if (define.paramList.params.length !== 1) {
    throw new Error("Can only determine the degree of functions with 1 input variable.");
  }

  const input = define.paramList.params[0].name;
  const variables: { [name: string]: number } = { [input]: 1 };

  const transformer: Transformer<number> = {
    add: ({ left, right }) => {
      if (isNaN(left) || isNaN(right)) {
        return NaN;
      }
      return Math.abs(left) > Math.abs(right) ? left : right;
    },
    assign: ({ name, value }) => {
      variables[name] = value;
      return NaN;
    },
    call: () => NaN,
    define: ({ stmtList }) => stmtList,
    divide: ({ left, right }) => left - right,
    exponentiate: ({ left, right }, node) => {
      if (!isNaN(left) && right === 0) {
        return left * virtualMachine(compiler(node.right));
      }
      return NaN;
    },
    modulo: ({ left, right }) => left - right,
    multiply: ({ left, right }) => left + right,
    negate: ({ value }) => value,
    number: () => 0,
    program: ({ stmtList }) => stmtList,
    stmtList: ({ stmts }) => {
      const nodeDegree = stmts[stmts.length - 1];
      return nodeDegree === undefined || isNaN(nodeDegree) ? NaN : nodeDegree;
    },
    subtract: ({ left, right }) => {
      if (isNaN(left) || isNaN(right)) {
        return NaN;
      }
      return Math.abs(left) > Math.abs(right) ? left : right;
    },
    variable: ({ name }) => variables[name]
  };

  return Math.abs(transform(define, transformer));
};

export default degree;
