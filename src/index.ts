type StmtList = { type: "stmtList", stmts: AST[] };
type AST = (
  | { type: "call", name: string }
  | { type: "define", name: string, stmtList: StmtList }
  | { type: "getLocal", name: string }
  | { type: "number", value: number }
  | { type: "send", recv: AST, name: string, args: AST[] }
  | { type: "setLocal", name: string, value: AST }
  | StmtList
);

const call = (name: string): AST => ({ type: "call", name });
const define = (name: string, stmtList: StmtList): AST => ({ type: "define", name, stmtList });
const getLocal = (name: string): AST => ({ type: "getLocal", name });
const number = (value: number): AST => ({ type: "number", value });
const send = (recv: AST, name: string, args: AST[]) => ({ type: "send" as const, recv, name, args });
const setLocal = (name: string, value: AST): AST => ({ type: "setLocal", name, value });
const stmtList = (stmts: AST[]): StmtList => ({ type: "stmtList", stmts });

const add = (left: AST, right: AST): AST => send(left, "+", [right]);
const negative = (value: AST): AST => send(value, "@-", []);
const subtract = (left: AST, right: AST): AST => send(left, "-", [right]);

const debug = (node: AST, indent: string = ""): string => {
  switch (node.type) {
    case "call":
      return `${node.name}()`;
    case "define":
      return `function ${node.name}() {\n${debug(node.stmtList, `${indent}  `)}\n}`;
    case "getLocal":
      return `${indent}${node.name}`;
    case "number":
      return `${indent}<${node.value}>`;
    case "send":
      return `${indent}${debug(node.recv)} ${node.name} ${node.args.map((arg) => debug(arg, indent)).join(", ")}`;
    case "setLocal":
      return `${indent}${node.name} = ${debug(node.value)}`;
    case "stmtList":
      return node.stmts.map((stmt) => debug(stmt, indent)).join("\n");
  }
};

const stdlib = {
  "@-"(recv: number) {
    return recv * -1;
  },
  "+"(recv: number, arg: number) {
    return recv + arg;
  },
  "-"(recv: number, arg: number) {
    return recv - arg;
  }
};

function isStdLibFunc<T>(key: string): key is keyof typeof stdlib {
  return key in stdlib;
}

type Context = {
  funcs: { [key: string]: StmtList },
  locals: { [key: string]: number }
};

const evaluate = (node: AST, context: Context): number => {
  switch (node.type) {
    case "call":
      return evaluate(context.funcs[node.name], { funcs: context.funcs, locals: {} });
    case "define":
      context.funcs[node.name] = node.stmtList;
      return NaN;
    case "getLocal":
      return context.locals[node.name];
    case "number":
      return node.value;
    case "send":
      const recv = evaluate(node.recv, context);
      const args = node.args.map((arg) => evaluate(arg, context));
      const { name } = node;

      if (!isStdLibFunc(name)) {
        throw new Error(`unknown function: ${name}`);
      }

      const func = stdlib[name];
      if (args.length !== func.length - 1) {
        throw new Error(`unexpected number of arguments, got ${args.length} expected ${func.length - 1}`);
      }

      return (func as any).apply(null, [recv].concat(args));
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

const tree = stmtList([
  define("func", stmtList([
    setLocal("foo", add(number(1), number(2))),
    setLocal("bar", subtract(getLocal("foo"), negative(number(3))))
  ])),
  call("func")
]);

console.log("DEBUG");
console.log(debug(tree));

console.log("\nEVAL")
console.log(evaluate(tree, { funcs: {}, locals: {} }));
