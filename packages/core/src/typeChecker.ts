import { Nodes } from "./types";
import { StdLib } from "./stdlib";

type GraphNode<T> = { value: T, lines: GraphNode<T>[] };
class Graph<T> {
  public nodes: GraphNode<T>[];

  constructor() {
    this.nodes = [];
  }

  add(value: T) {
    this.nodes.push({ value, lines: [] });
  }

  connect(lower: T, upper: T) {
    const lowerNode = this.find(lower);
    const upperNode = this.find(upper);

    if (!lowerNode || !upperNode) {
      throw new Error("Both nodes need to exist");
    }

    lowerNode.lines.push(upperNode);
  }

  find(value: T) {
    return this.nodes.find(node => node.value === value);
  }
}

type FuncType = { params: Nodes.Type[], returns: Nodes.Type } & Nodes.Type;

const typeGrapher = (node: Nodes.All): Graph<Nodes.Type> => {
  const graph = new Graph<Nodes.Type>();

  const makeFunc = (paramTypes: string[], returnType: string): FuncType => {
    const type: FuncType = { kind: "Function", params: [], returns: { kind: returnType } };
    graph.add(type);

    paramTypes.forEach((paramType, index) => {
      type.params[index] = { kind: paramType };
      graph.add(type.params[index]);
    });

    graph.add(type.returns);

    return type;
  };

  const stdlibTypes: { [T in keyof StdLib]: FuncType } = {
    add: makeFunc(["Number", "Number"], "Number"),
    divide: makeFunc(["Number", "Number"], "Number"),
    exponentiate: makeFunc(["Number", "Number"], "Number"),
    ln: makeFunc(["Number"], "Number"),
    log: makeFunc(["Number"], "Number"),
    modulo: makeFunc(["Number", "Number"], "Number"),
    multiply: makeFunc(["Number", "Number"], "Number"),
    negate: makeFunc(["Number"], "Number"),
    print: makeFunc(["Number"], "Number"),
    sqrt: makeFunc(["Number"], "Number"),
    subtract: makeFunc(["Number", "Number"], "Number")
  };

  const isStdLib = (key: string): key is keyof typeof stdlibTypes => key in stdlibTypes;

  const visitor = (node: Nodes.All): void => {
    graph.add(node.type);

    switch (node.kind) {
      case "add":
      case "divide":
      case "exponentiate":
      case "modulo":
      case "multiply":
      case "subtract": {
        node.type.kind = "Open";

        node.left.type.context = node.type.context;
        node.right.type.context = node.type.context;

        visitor(node.left);
        visitor(node.right);

        const func = stdlibTypes[node.kind];
        graph.connect(node.left.type, func.params[0]);
        graph.connect(node.right.type, func.params[1]);
        graph.connect(func.returns, node.type);

        break;
      }
      case "assign": {
        node.type.kind = "Undefined";

        node.value.type.context = node.type.context;

        const type = { kind: "Open" };
        node.type.context.locals[node.name] = type;
        graph.add(type);

        visitor(node.value);

        graph.connect(node.value.type, node.type);
        graph.connect(node.type.context.locals[node.name], node.type);

        break;
      }
      case "call": {
        node.type.kind = "Open";

        node.args.forEach((arg) => {
          arg.type.context = node.type.context;
        });

        node.args.forEach(visitor);
  
        const func: FuncType = isStdLib(node.name) ? stdlibTypes[node.name] : node.type.context.funcs[node.name];
        func.params.forEach((param, index) => {
          graph.connect(node.args[index].type, param);
        });

        graph.connect(func.returns, node.type);

        break;
      }
      case "define": {
        node.type.kind = "Undefined";

        const type = makeFunc(node.paramList.params.map(() => "Open"), "Open");
        node.type.context.funcs[node.name] = type;

        visitor(node.stmtList);

        graph.connect(node.stmtList.type, node.type.context.funcs[node.name].returns);

        break;
      }
      case "negate":
        node.type.kind = "Number";

        node.value.type.context = node.type.context;

        visitor(node.value);

        graph.connect(node.value.type, node.type);

        break;
      case "number":
        node.type.kind = "Number";

        break;
      case "program":
        node.type.kind = "Undefined";

        visitor(node.stmtList);

        graph.connect(node.stmtList.type, node.type);

        break;
      case "stmtList":
        node.type.kind = "Open";

        node.type.locals = {} as { [key: string]: Nodes.Type };
        node.type.funcs = {} as { [key: string]: Nodes.Type };
  
        node.stmts.forEach((stmt) => {
          stmt.type.context = node.type;
        });

        node.stmts.forEach(visitor);

        graph.connect(node.stmts[node.stmts.length - 1].type, node.type);

        break;
      case "variable":
        node.type.kind = "Open";

        graph.connect(node.type.context.locals[node.name], node.type);

        break;
    }
  }

  visitor(node);

  return graph;
};

const typeChecker = (node: Nodes.All): string[] => {
  const graph = typeGrapher(node);
  const errors: { lower: Nodes.Type, upper: Nodes.Type }[] = [];

  for (const graphNode of graph.nodes) {
    const lower = graphNode.value;
    if (lower.kind === "Open") {
      continue;
    }

    const queue: GraphNode<Nodes.Type>[] = [];
    graphNode.lines.forEach((line) => {
      queue.push(line);
    });

    while (queue.length > 0) {
      const line = queue.shift()!;
      const upper = line.value;

      switch (upper.kind) {
        case "Open":
          line.lines.forEach((line) => {
            queue.push(line);
          });
          break;
        case "Number":
        case "Undefined":
          if (lower.kind !== upper.kind) {
            errors.push({ lower, upper });
          }
          break;
      }
    }
  }

  return errors.map(({ lower, upper }) => `Expected ${lower.kind} got ${upper.kind}`);
};

export default typeChecker;
