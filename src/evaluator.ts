import { Nodes } from "./types";

// The standard library of this little language
const stdlib = {
  neg: (value: number) => value * -1,
  add: (left: number, right: number) => left + right,
  sub: (left: number, right: number) => left - right,
  mul: (left: number, right: number) => left * right,
  div: (left: number, right: number) => {
    if (right === 0) {
      throw new Error("Division by 0");
    }
    return left / right;
  },
  exp: (value: number, power: number) => Math.pow(value, power)
};

function isStdLibFunc(key: string): key is keyof typeof stdlib {
  return key in stdlib;
}

type Context = {
  funcs: { [key: string]: Nodes.Define },
  locals: { [key: string]: number }
};

// Evaluate a call node within a certain context
const evaluateCall = (node: Nodes.Call, context: Context) => {
  const getArgs = (arity: number) => {
    if (arity !== node.args.length) {
      throw new Error(`got ${node.args.length} args, expected ${arity}`);
    }

    return node.args.map((arg) => evaluator(arg, context));
  };

  if (isStdLibFunc(node.name)) {
    const func = stdlib[node.name];
    return (func as any)(...getArgs(func.length));
  }

  if (Object.prototype.hasOwnProperty.call(context.funcs, node.name)) {
    const define = context.funcs[node.name];
    const locals: { [key: string]: number } = {};

    getArgs(define.paramList.params.length).forEach((arg, index) => {
      locals[define.paramList.params[index].name] = arg;
    });

    return evaluator(define.stmtList, { funcs: context.funcs, locals });
  }

  throw new Error(`unknown function: ${node.name}`);
};

// Evaluate a visitable AST node within a certain context
const evaluator = (node: Nodes.All, context: Context = { funcs: {}, locals: {} }): number => {
  switch (node.type) {
    case "call":
      return evaluateCall(node, context);
    case "define":
      context.funcs[node.name] = node;
      return NaN;
    case "getLocal":
      return context.locals[node.name];
    case "number":
      return node.value;
    case "program":
      return evaluator(node.stmtList, context);
    case "setLocal":
      context.locals[node.name] = evaluator(node.value, context);
      return context.locals[node.name];
    case "stmtList":
      let value = null;
      node.stmts.forEach((stmt) => {
        value = evaluator(stmt, context)
      });
      return value || (value === 0 ? 0 : NaN);
  }
};

export default evaluator;
