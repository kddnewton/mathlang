import { Nodes } from "./types";

export type Visitor = Partial<{ [T in Nodes.All["type"]]: {
  enter?: (node: Nodes.All & { type: T }) => void,
  exit?: (node: Nodes.All & { type: T }) => void
}}>;

const visit = (node: Nodes.Program, visitor: Visitor): void => {
  const visitNode = (node: Nodes.All): void => {
    const callbacks = visitor[node.type];
    if (callbacks && callbacks.enter) {
      (callbacks.enter as any)(node);
    }

    switch (node.type) {
      case "add":
      case "divide":
      case "exponentiate":
      case "modulo":
      case "multiply":
      case "subtract":
        visitNode(node.left);
        visitNode(node.right);
        break;
      case "call":
        node.args.forEach(visitNode);
        break;
      case "define":
      case "program":
        visitNode(node.stmtList);
        break;
      case "setLocal":
        visitNode(node.value);
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
