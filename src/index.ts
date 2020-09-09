// AST node types
namespace Node {
  export type Number = { type: "number", value: number };

  export type GetLocal = { type: "getLocal", name: string };
  export type SetLocal = { type: "setLocal", name: string, value: Expr };

  export type Call = { type: "call", name: string, args: Expr[] };
  export type Define = { type: "define", name: string, params: Param[], stmtList: StmtList };
  export type Param = { type: "param", name: string };

  export type StmtList = { type: "stmtList", stmts: Stmt[] };
  export type Program = { type: "program", stmtList: StmtList };

  export type Expr = Call | GetLocal | Number;
  export type Stmt = Define | Expr | SetLocal;

  export type Visitable = Stmt | StmtList | Program;
}

// AST node builders
const number = (value: number): Node.Number => ({ type: "number", value });

const getLocal = (name: string): Node.GetLocal => ({ type: "getLocal", name });
const setLocal = (name: string, value: Node.Expr): Node.SetLocal => ({ type: "setLocal", name, value });

const call = (name: string, args: Node.Expr[]): Node.Call => ({ type: "call", name, args });
const define = (name: string, params: Node.Param[], stmtList: Node.StmtList): Node.Define => ({ type: "define", name, params, stmtList });
const param = (name: string): Node.Param => ({ type: "param", name });

const stmtList = (stmts: Node.Stmt[]): Node.StmtList => ({ type: "stmtList", stmts });
const program = (stmtList: Node.StmtList): Node.Program => ({ type: "program", stmtList });

// The standard library of this little language
const stdlib = {
  neg: (value: number) => value * -1,
  add: (left: number, right: number) => left + right,
  sub: (left: number, right: number) => left - right,
  mul: (left: number, right: number) => left * right,
  div: (left: number, right: number) => left / right,
  exp: (value: number, power: number) => Math.pow(value, power)
};

function isStdLibFunc(key: string): key is keyof typeof stdlib {
  return key in stdlib;
}

// Higher-level AST node builders, could be used for further optimizations
const unary = (name: string) => (value: Node.Expr): Node.Call => call(name, [value]);
const binary = (name: string) => (left: Node.Expr, right: Node.Expr): Node.Call => call(name, [left, right]);

const neg = unary("neg");
const add = binary("add");
const sub = binary("sub");
const mul = binary("mul");
const div = binary("div");
const exp = binary("exp");

// Output a node to readable pseudo-code
const generate = (node: Node.Visitable, indent: string = ""): string => {
  switch (node.type) {
    case "number":
      return `${indent}${node.value}`;
    case "getLocal":
      return `${indent}${node.name}`;
    case "setLocal":
      return `${indent}${node.name} = ${generate(node.value)}`;
    case "call":
      return `${indent}${node.name}(${node.args.map((arg) => generate(arg)).join(", ")})`;
    case "define":
      const params = node.params.map((param) => param.name).join(", ");
      return `def ${node.name}(${params}) {\n${generate(node.stmtList, `${indent}  `)}\n}`;
    case "program":
      return generate(node.stmtList);
    case "stmtList":
      return node.stmts.map((stmt) => generate(stmt, indent)).join("\n");
  }
};

type Context = {
  funcs: { [key: string]: Node.Define },
  locals: { [key: string]: number }
};

// Evaluate a call node within a certain context
const evaluateCall = (node: Node.Call, context: Context) => {
  const getArgs = (arity: number) => {
    if (arity !== node.args.length) {
      throw new Error(`got ${node.args.length} args, expected ${arity}`);
    }

    return node.args.map((arg) => evaluate(arg, context));
  };

  if (isStdLibFunc(node.name)) {
    const func = stdlib[node.name];
    return (func as any)(...getArgs(func.length));
  }

  if (Object.prototype.hasOwnProperty.call(context.funcs, node.name)) {
    const define = context.funcs[node.name];
    const locals: { [key: string]: number } = {};

    getArgs(define.params.length).forEach((arg, index) => {
      locals[define.params[index].name] = arg;
    });

    return evaluate(define.stmtList, { funcs: context.funcs, locals });
  }

  throw new Error(`unknown function: ${name}`);
};

// Evaluate a visitable AST node within a certain context
const evaluate = (node: Node.Visitable, context: Context): number => {
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
      return evaluate(node.stmtList, context);
    case "setLocal":
      context.locals[node.name] = evaluate(node.value, context);
      return context.locals[node.name];
    case "stmtList":
      let value = null;
      node.stmts.forEach((stmt) => {
        value = evaluate(stmt, context)
      });
      return value || (value === 0 ? 0 : NaN);
  }
};

// Build out an example tree
const tree = program(stmtList([
  define("func", [param("foo")], stmtList([
    setLocal("bar", add(getLocal("foo"), exp(number(2), number(2)))),
    setLocal("baz", sub(getLocal("bar"), neg(number(3)))),
    add(getLocal("baz"), number(2))
  ])),
  call("func", [number(1)])
]));

console.log("GENERATE:");
console.log(generate(tree));

console.log("\nEVALUATE:");
console.log(evaluate(tree, { funcs: {}, locals: {} }));
