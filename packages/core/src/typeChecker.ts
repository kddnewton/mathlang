import { Nodes } from "./types";
import visit, { Visitor } from "./visit";

type Node<T> = { value: T, lines: Node<T>[] };
class Graph<T> {
  public nodes: Node<T>[];

  constructor() {
    this.nodes = [];
  }

  add(meta: T) {
    this.nodes.push({ value: meta, lines: [] });
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

const binaryContextVisitor = {
  enter(node: Nodes.Binary) {
    node.left.meta.context = node.meta.context;
    node.right.meta.context = node.meta.context;
  }
};

const contextVisitor: Visitor = {
  add: binaryContextVisitor,
  assign: {
    enter(node) {
      node.value.meta.context = node.meta.context;
    }
  },
  call: {
    enter(node) {
      node.args.forEach((arg) => {
        arg.meta.context = node.meta.context;
      });
    }
  },
  divide: binaryContextVisitor,
  exponentiate: binaryContextVisitor,
  modulo: binaryContextVisitor,
  multiply: binaryContextVisitor,
  negate: {
    enter(node) {
      node.value.meta.context = node.meta.context;
    }
  },
  stmtList: {
    enter(node) {
      node.meta.locals = {} as { [key: string]: Nodes.Meta };
      node.meta.funcs = {} as { [key: string]: Nodes.Meta };

      node.stmts.forEach((stmt) => {
        stmt.meta.context = node.meta;
      });
    }
  },
  subtract: binaryContextVisitor
};

const makeGraphVisitor = (graph: Graph<Nodes.Meta>): Visitor => {
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

  const stdlib = {
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

  function isStdLib(key: string): key is keyof typeof stdlib {
    return key in stdlib;
  }

  const binary = (name: keyof typeof stdlib) => ({
    enter(node: Nodes.Binary) {
      graph.add(node.meta);
      node.meta.kind = "Open";
    },
    exit(node: Nodes.Binary) {
      const func = stdlib[name];

      graph.connect(node.left.meta, func.params[0]);
      graph.connect(node.right.meta, func.params[1]);
      graph.connect(func.returns, node.meta);
    }
  });

  const graphVisitor: Visitor = {
    add: binary("add"),
    assign: {
      enter(node) {
        const meta = { kind: "Open" };
        node.meta.context.locals[node.name] = meta;
        graph.add(meta);

        graph.add(node.meta);
        node.meta.kind = "Open";
      },
      exit(node) {
        graph.connect(node.value.meta, node.meta);
        graph.connect(node.meta.context.locals[node.name], node.meta);
      }
    },
    call: {
      enter(node) {
        graph.add(node.meta);
        node.meta.kind = "Open";
      },
      exit(node) {
        const func: FuncType = isStdLib(node.name) ? stdlib[node.name] : node.meta.context.funcs[node.name];

        func.params.forEach((param, index) => {
          graph.connect(node.args[index].meta, param);
        });

        graph.connect(func.returns, node.meta);
      }
    },
    define: {
      enter(node) {
        const meta = makeFunc(node.paramList.params.map(() => "Open"), "Open");
        node.meta.context.funcs[node.name] = meta;

        graph.add(node.meta);
        node.meta.kind = "Undefined";
      },
      exit(node) {
        graph.connect(node.stmtList.meta, node.meta.context.funcs[node.name].returns);
      }
    },
    divide: binary("divide"),
    exponentiate: binary("exponentiate"),
    modulo: binary("modulo"),
    multiply: binary("multiply"),
    negate: {
      enter(node) {
        graph.add(node.meta);
        node.meta.kind = "Number";
      },
      exit(node) {
        graph.connect(node.value.meta, node.meta);
      }
    },
    number: {
      enter(node) {
        graph.add(node.meta);
        node.meta.kind = "Number";
      }
    },
    stmtList: {
      enter(node) {
        graph.add(node.meta);
        node.meta.kind = "Open";
      },
      exit(node) {
        graph.connect(node.stmts[node.stmts.length - 1].meta, node.meta);
      }
    },
    subtract: binary("subtract"),
    variable: {
      enter(node) {
        graph.add(node.meta);
        node.meta.kind = "Open";
      },
      exit(node) {
        graph.connect(node.meta.context.locals[node.name], node.meta);
      }
    }
  };

  return graphVisitor;
};

const typeGrapher = (node: Nodes.All): Graph<Nodes.Meta> => {
  const graph = new Graph<Nodes.Meta>();

  visit(node, contextVisitor);
  visit(node, makeGraphVisitor(graph));

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

    const queue: Node<Nodes.Meta>[] = [];
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
