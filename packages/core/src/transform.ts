import { Nodes } from "./types";

type NodeKind<K> = Nodes.All & { kind: K };
type TransformerResult<T, K> = {
  [P in keyof NodeKind<K>]:
    NodeKind<K>[P] extends Nodes.All
      ? T
      : NodeKind<K>[P] extends Nodes.All[]
      ? T[]
      : NodeKind<K>[P]
};

type TransformerCallback<T, K> = (transformed: TransformerResult<T, K>) => T;
export type Transformer<T> = { [K in Nodes.All["kind"]]: TransformerCallback<T, K> };

const transform = <T>(node: Nodes.All, transformer: Transformer<T>): T => {
  const transformNode = (node: Nodes.All): T => {
    switch (node.kind) {
      case "add":
        return transformer[node.kind]({ ...node, left: transformNode(node.left), right: transformNode(node.right) });
      case "assign":
        return transformer[node.kind]({ ...node, value: transformNode(node.value) });
      case "call":
        return transformer[node.kind]({ ...node, args: node.args.map(transformNode) });
      case "define":
        return transformer[node.kind]({ ...node, stmtList: transformNode(node.stmtList) });
      case "divide":
        return transformer[node.kind]({ ...node, left: transformNode(node.left), right: transformNode(node.right) });
      case "exponentiate":
        return transformer[node.kind]({ ...node, left: transformNode(node.left), right: transformNode(node.right) });
      case "modulo":
        return transformer[node.kind]({ ...node, left: transformNode(node.left), right: transformNode(node.right) });
      case "multiply":
        return transformer[node.kind]({ ...node, left: transformNode(node.left), right: transformNode(node.right) });
      case "negate":
        return transformer[node.kind]({ ...node, value: transformNode(node.value) });
      case "number":
        return transformer[node.kind]({ ...node });
      case "program":
        return transformer[node.kind]({ ...node, stmtList: transformNode(node.stmtList) });
      case "stmtList":
        return transformer[node.kind]({ ...node, stmts: node.stmts.map(transformNode) });
      case "subtract":
        return transformer[node.kind]({ ...node, left: transformNode(node.left), right: transformNode(node.right) });
      case "variable":
        return transformer[node.kind]({ ...node });
    }
  }

  return transformNode(node);
};

export default transform;
