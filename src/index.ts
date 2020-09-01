type AST = (
  | { type: "binary", left: AST, oper: string, right: AST }
  | { type: "getLocal", name: string }
  | { type: "number", value: number }
  | { type: "setLocal", name: string, value: AST }
  | { type: "statements", stmts: AST[] }
)

const binary = (left: AST, oper: string, right: AST): AST => ({ type: "binary", left, oper, right });
const getLocal = (name: string): AST => ({ type: "getLocal", name });
const number = (value: number): AST => ({ type: "number", value });
const setLocal = (name: string, value: AST): AST => ({ type: "setLocal", name, value });
const statements = (stmts: AST[]): AST => ({ type: "statements", stmts });

const add = (left: AST, right: AST): AST => binary(left, "+", right);
const subtract = (left: AST, right: AST): AST => binary(left, "-", right);

const debug = (node: AST): string => {
  switch (node.type) {
    case "binary":
      return `binary(${debug(node.left)}, ${node.oper}, ${debug(node.right)})`;
    case "getLocal":
      return `getLocal(${node.name})`;
    case "number":
      return node.value.toString();
    case "setLocal":
      return `setLocal(${node.name}, ${debug(node.value)})`;
    case "statements":
      return node.stmts.map(debug).join("\n");
  }
};

const ruby = (node: AST): string => {
  switch (node.type) {
    case "binary":
      return `${ruby(node.left)} ${node.oper} ${ruby(node.right)}`;
    case "getLocal":
      return node.name;
    case "number":
      return node.value.toString();
    case "setLocal":
      return `${node.name} = ${ruby(node.value)}`;
    case "statements":
      return node.stmts.map(ruby).join("\n");
  }
};

const js = (node: AST): string => {
  switch (node.type) {
    case "binary":
      return `${js(node.left)} ${node.oper} ${js(node.right)}`;
    case "getLocal":
      return node.name;
    case "number":
      return node.value.toString();
    case "setLocal":
      return `const ${node.name} = ${js(node.value)}`;
    case "statements":
      return node.stmts.map((stmt) => `${js(stmt)};`).join("\n");
  }
};

type LocalTable = { [key: string]: number };

const evaluate = (node: AST, locals: LocalTable): number => {
  switch (node.type) {
    case "binary":
      const left = evaluate(node.left, locals);
      const right = evaluate(node.right, locals);

      switch (node.oper) {
        case "+":
          return left + right;
        case "-":
          return left - right;
        default:
          throw new Error(`unknown operation: ${node.oper}`);
      }
    case "getLocal":
      return locals[node.name];
    case "number":
      return node.value;
    case "setLocal":
      locals[node.name] = evaluate(node.value, locals);
      return locals[node.name];
    case "statements":
      let value = null;
      node.stmts.forEach((stmt) => {
        value = evaluate(stmt, locals)
      });
      return value === 0 ? 0 : NaN;
  }
};

const tree = statements([
  setLocal("foo", add(number(1), number(2))),
  setLocal("bar", subtract(getLocal("foo"), number(3)))
]);

console.log("DEBUG");
console.log(debug(tree));

console.log("\nRUBY");
console.log(ruby(tree));

console.log("\nJS");
console.log(js(tree));

console.log("\nEvaluation")
console.log(evaluate(tree, {}));
