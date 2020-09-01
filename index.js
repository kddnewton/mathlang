const binary = (left, oper, right) => ({ type: "binary", left, oper, right });
const getLocal = (name) => ({ type: "getLocal", name });
const number = (value) => ({ type: "number", value });
const setLocal = (name, value) => ({ type: "setLocal", name, value });
const statements = (stmts) => ({ type: "statements", statements: stmts });

const add = (left, right) => binary(left, "+", right);
const subtract = (left, right) => binary(left, "-", right);

const debug = (node) => {
  switch (node.type) {
    case "binary":
      return `binary(${debug(node.left)}, ${node.oper}, ${debug(node.right)})`;
    case "getLocal":
      return `getLocal(${node.name})`;
    case "number":
      return node.value;
    case "setLocal":
      return `setLocal(${node.name}, ${debug(node.value)})`;
    case "statements":
      return node.statements.map(debug).join("\n");
  }
};

const ruby = (node) => {
  switch (node.type) {
    case "binary":
      return `${ruby(node.left)} ${node.oper} ${ruby(node.right)}`;
    case "getLocal":
      return node.name;
    case "number":
      return node.value;
    case "setLocal":
      return `${node.name} = ${ruby(node.value)}`;
    case "statements":
      return node.statements.map(ruby).join("\n");
  }
};

const js = (node) => {
  switch (node.type) {
    case "binary":
      return `${js(node.left)} ${node.oper} ${js(node.right)}`;
    case "getLocal":
      return node.name;
    case "number":
      return node.value;
    case "setLocal":
      return `const ${node.name} = ${js(node.value)}`;
    case "statements":
      return node.statements.map((statement) => `${js(statement)};`).join("\n");
  }
};

const evaluate = (node, locals = {}) => {
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
      node.statements.forEach((statement) => {
        value = evaluate(statement, locals)
      });
      return value;
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
console.log(evaluate(tree));
