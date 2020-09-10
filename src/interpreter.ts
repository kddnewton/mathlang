import { Nodes } from "./types";
import stdlib, { isStdLibFunc } from "./stdlib";

type Context = {
  funcs: { [key: string]: Nodes.Define },
  locals: { [key: string]: number }
};

// Evaluate a call node within a certain context
const interpretCall = (node: Nodes.Call, context: Context) => {
  const getArgs = (arity: number) => {
    if (arity !== node.args.length) {
      throw new Error(`got ${node.args.length} args, expected ${arity}`);
    }

    return node.args.map((arg) => interpreter(arg, context));
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

    return interpreter(define.stmtList, { funcs: context.funcs, locals });
  }

  throw new Error(`unknown function: ${node.name}`);
};

// Evaluate a visitable AST node within a certain context
const interpreter = (node: Nodes.All, context: Context = { funcs: {}, locals: {} }): number => {
  switch (node.type) {
    case "call":
      return interpretCall(node, context);
    case "define":
      context.funcs[node.name] = node;
      return NaN;
    case "getLocal":
      return context.locals[node.name];
    case "number":
      return node.value;
    case "program":
      return interpreter(node.stmtList, context);
    case "setLocal":
      context.locals[node.name] = interpreter(node.value, context);
      return context.locals[node.name];
    case "stmtList":
      let value = null;
      node.stmts.forEach((stmt) => {
        value = interpreter(stmt, context)
      });
      return value || (value === 0 ? 0 : NaN);
  }
};

export default interpreter;
