type AST = (
  | { type: "getLocal", name: string }
  | { type: "number", value: number }
  | { type: "send", recv: AST, name: string, args: AST[] }
  | { type: "setLocal", name: string, value: AST }
  | { type: "statements", stmts: AST[] }
)

const getLocal = (name: string): AST => ({ type: "getLocal", name });
const number = (value: number): AST => ({ type: "number", value });
const send = (recv: AST, name: string, args: AST[]) => ({ type: "send" as const, recv, name, args });
const setLocal = (name: string, value: AST): AST => ({ type: "setLocal", name, value });
const statements = (stmts: AST[]): AST => ({ type: "statements", stmts });

const add = (left: AST, right: AST): AST => send(left, "+", [right]);
const negative = (value: AST): AST => send(value, "@-", []);
const subtract = (left: AST, right: AST): AST => send(left, "-", [right]);

const debug = (node: AST): string => {
  switch (node.type) {
    case "getLocal":
      return `getLocal(${node.name})`;
    case "number":
      return `number<${node.value}>`;
    case "send":
      return `${debug(node.recv)}.${node.name}(${node.args.map(debug).join(", ")})`;
    case "setLocal":
      return `setLocal(${node.name}, ${debug(node.value)})`;
    case "statements":
      return node.stmts.map(debug).join("\n");
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

const evaluate = (node: AST, locals: { [key: string]: number }): number => {
  switch (node.type) {
    case "getLocal":
      return locals[node.name];
    case "number":
      return node.value;
    case "send":
      const recv = evaluate(node.recv, locals);
      const args = node.args.map((arg) => evaluate(arg, locals));
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
      locals[node.name] = evaluate(node.value, locals);
      return locals[node.name];
    case "statements":
      let value = null;
      node.stmts.forEach((stmt) => {
        value = evaluate(stmt, locals)
      });
      return value || (value === 0 ? 0 : NaN);
  }
};

const tree = statements([
  setLocal("foo", add(number(1), number(2))),
  setLocal("bar", subtract(getLocal("foo"), negative(number(3))))
]);

console.log("DEBUG");
console.log(debug(tree));

console.log("\nEVAL")
console.log(evaluate(tree, {}));
