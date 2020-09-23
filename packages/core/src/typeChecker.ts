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

type FuncType = { params: Nodes.Meta[], returns: Nodes.Meta } & Nodes.Meta;

const typeGrapher = (node: Nodes.All): Graph<Nodes.Meta> => {
  const graph = new Graph<Nodes.Meta>();

  const makeFunc = (paramTypes: string[], returnType: string): FuncType => {
    const meta: FuncType = { kind: "Function", params: [], returns: { kind: returnType } };
    graph.add(meta);

    paramTypes.forEach((paramType, index) => {
      meta.params[index] = { kind: paramType };
      graph.add(meta.params[index]);
    });

    graph.add(meta.returns);

    return meta;
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
    switch (node.kind) {
      case "add":
      case "divide":
      case "exponentiate":
      case "modulo":
      case "multiply":
      case "subtract": {
        graph.add(node.meta);
        node.meta.kind = "Open";

        node.left.meta.context = node.meta.context;
        node.right.meta.context = node.meta.context;

        visitor(node.left);
        visitor(node.right);

        const func = stdlibTypes[node.kind];
        graph.connect(node.left.meta, func.params[0]);
        graph.connect(node.right.meta, func.params[1]);
        graph.connect(func.returns, node.meta);

        break;
      }
      case "assign": {
        graph.add(node.meta);
        node.meta.kind = "Undefined";

        node.value.meta.context = node.meta.context;

        const meta = { kind: "Open" };
        node.meta.context.locals[node.name] = meta;
        graph.add(meta);

        visitor(node.value);

        graph.connect(node.value.meta, node.meta);
        graph.connect(node.meta.context.locals[node.name], node.meta);

        break;
      }
      case "call": {
        graph.add(node.meta);
        node.meta.kind = "Open";

        node.args.forEach((arg) => {
          arg.meta.context = node.meta.context;
        });

        node.args.forEach(visitor);
  
        const func: FuncType = isStdLib(node.name) ? stdlibTypes[node.name] : node.meta.context.funcs[node.name];
        func.params.forEach((param, index) => {
          graph.connect(node.args[index].meta, param);
        });

        graph.connect(func.returns, node.meta);

        break;
      }
      case "define": {
        graph.add(node.meta);
        node.meta.kind = "Undefined";

        const meta = makeFunc(node.paramList.params.map(() => "Open"), "Open");
        node.meta.context.funcs[node.name] = meta;

        visitor(node.stmtList);

        graph.connect(node.stmtList.meta, node.meta.context.funcs[node.name].returns);

        break;
      }
      case "negate":
        graph.add(node.meta);
        node.meta.kind = "Number";

        node.value.meta.context = node.meta.context;

        visitor(node.value);

        graph.connect(node.value.meta, node.meta);

        break;
      case "number":
        graph.add(node.meta);
        node.meta.kind = "Number";

        break;
      case "program":
        graph.add(node.meta);
        node.meta.kind = "Undefined";

        visitor(node.stmtList);

        graph.connect(node.stmtList.meta, node.meta);

        break;
      case "stmtList":
        graph.add(node.meta);
        node.meta.kind = "Open";

        node.meta.locals = {} as { [key: string]: Nodes.Meta };
        node.meta.funcs = {} as { [key: string]: Nodes.Meta };
  
        node.stmts.forEach((stmt) => {
          stmt.meta.context = node.meta;
        });

        node.stmts.forEach(visitor);

        graph.connect(node.stmts[node.stmts.length - 1].meta, node.meta);

        break;
      case "variable":
        graph.add(node.meta);
        node.meta.kind = "Open";

        graph.connect(node.meta.context.locals[node.name], node.meta);

        break;
    }
  }

  visitor(node);

  return graph;
};

const typeChecker = (node: Nodes.All): string[] => {
  const graph = typeGrapher(node);
  const errors: { lower: Nodes.Meta, upper: Nodes.Meta }[] = [];

  for (const graphNode of graph.nodes) {
    const lower = graphNode.value;
    if (lower.kind === "Open") {
      continue;
    }

    const queue: GraphNode<Nodes.Meta>[] = [];
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
