import { Nodes } from "./types";

export type Visitor = Partial<{ [T in Nodes.All["kind"]]: {
  enter?: (node: Nodes.All & { kind: T }) => void,
  exit?: (node: Nodes.All & { kind: T }) => void
}}>;

const visit = (node: Nodes.All, visitor: Visitor): void => {
  const visitNode = (node: Nodes.All): void => {
    const callbacks = visitor[node.kind];
    if (callbacks && callbacks.enter) {
      (callbacks.enter as any)(node);
    }

    switch (node.kind) {
      case "add":
      case "divide":
      case "exponentiate":
      case "modulo":
      case "multiply":
      case "subtract":
        visitNode(node.left);
        visitNode(node.right);
        break;
      case "assign":
      case "negate":
        visitNode(node.value);
        break;
      case "call":
        node.args.forEach(visitNode);
        break;
      case "define":
      case "program":
        visitNode(node.stmtList);
        break;
      case "stmtList":
        node.stmts.forEach(visitNode);
        break;
      default:
        break;
    }

    if (callbacks && callbacks.exit) {
      (callbacks.exit as any)(node);
    }
  }

  visitNode(node);
};

export default visit;
