import { Nodes, Tokens } from "./types";
import { program, stmtList, number, add, sub, mul, div, exp } from "./builders";

/**
 * Grammar:
 * 
 * Program -> StmtList
 * StmtList -> Stmt "\n" StmtList | Stmt
 * Stmt -> Define | SetLocal | Expr
 * Define -> Name "(" ParamList ")" "{" StmtList "}"
 * ParamList -> Name "," ParamList | Name | null
 * SetLocal -> Name "=" Expr
 * Expr -> Term "+" Term | Term "-" Term | Term
 * Term -> Power "*" Power | Power "/" Power | Power
 * Power -> Value "^" Power | Value
 * Value -> "(" Expr ")" | Number
 */

type Consumed<T> = { node: T, size: number } | null;

// Number
function consumeNumber(tokens: Tokens.All[], current: number): Consumed<Nodes.Number> {
  const token = tokens[current];

  if (token.type === "number") {
    return { node: number(token.value), size: 1 };
  }
  return null;
}

// Value -> "(" Expr ")" | Number
function consumeValue(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const token = tokens[current];

  if (token.type === "symbol" && token.value === "(") {
    const consumed = consumeExpr(tokens, current + 1);

    if (consumed) {
      const nextToken = tokens[current + 1 + consumed.size];

      if (nextToken && nextToken.type === "symbol" && nextToken.value === ")") {
        return { node: consumed.node, size: consumed.size + 2 };
      }
    }
  }

  return consumeNumber(tokens, current);
};

// Power -> Value "^" Power | Value
function consumePower(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumeValue(tokens, current);
  if (!leftConsumed) {
    throw new TypeError(tokens[current].type);
  }

  const operator = tokens[current + leftConsumed.size];
  if (!operator || operator.type !== "operator" || operator.value !== "^") {
    return leftConsumed;
  }

  const rightConsumed = consumePower(tokens, current + 1 + leftConsumed.size);
  if (!rightConsumed) {
    throw new TypeError(tokens[current + 1 + leftConsumed.size].type);
  }

  return {
    node: exp(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Term -> Power "*" Power | Power "/" Power | Power
function consumeTerm(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumePower(tokens, current);
  if (!leftConsumed) {
    throw new TypeError(tokens[current].type);
  }

  const operator = tokens[current + leftConsumed.size];
  if (!operator || operator.type !== "operator" || ["*", "/"].indexOf(operator.value) === -1) {
    return leftConsumed;
  }

  const rightConsumed = consumePower(tokens, current + 1 + leftConsumed.size);
  if (!rightConsumed) {
    throw new TypeError(tokens[current + 1 + leftConsumed.size].type);
  }

  const builder = operator.value === "*" ? mul : div;
  return {
    node: builder(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Expr -> Term "+" Term | Term "-" Term | Term
function consumeExpr(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumeTerm(tokens, current);
  if (!leftConsumed) {
    throw new TypeError(tokens[current].type);
  }

  const operator = tokens[current + leftConsumed.size];
  if (!operator || operator.type !== "operator" || ["+", "-"].indexOf(operator.value) === -1) {
    return leftConsumed;
  }

  const rightConsumed = consumeTerm(tokens, current + 1 + leftConsumed.size);
  if (!rightConsumed) {
    throw new TypeError(tokens[current + 1 + leftConsumed.size].type);
  }

  const builder = operator.value === "+" ? add : sub;
  return {
    node: builder(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Stmt -> Define | SetLocal | Expr
function consumeStmt(tokens: Tokens.All[], current: number): Consumed<Nodes.Stmt> {
  return consumeExpr(tokens, current);
}

// StmtList -> Stmt "\n" StmtList | Stmt
function consumeStmtList(tokens: Tokens.All[], current: number): Consumed<Nodes.StmtList> {
  const consumed = consumeStmt(tokens, current);
  if (!consumed) {
    throw new TypeError(tokens[current].type);
  }

  const nextToken = tokens[current + consumed.size];
  if (!nextToken || nextToken.type !== "newline") {
    return { node: stmtList([consumed.node]), size: consumed.size };
  }

  const nextStmtList = consumeStmtList(tokens, current + consumed.size + 1);
  if (!nextStmtList) {
    throw new TypeError(tokens[current + consumed.size + 1].type);
  }

  return {
    node: stmtList([consumed.node].concat(nextStmtList.node.stmts)),
    size: consumed.size + 1 + nextStmtList.size
  };
}

// Program -> StmtList
function consumeProgram(tokens: Tokens.All[], current: number): Consumed<Nodes.Program> {
  const consumed = consumeStmtList(tokens, current);
  if (!consumed) {
    throw new TypeError(tokens[current].type);
  }

  return { node: program(consumed.node), size: consumed.size };
}

const parser = (tokens: Tokens.All[]): Nodes.Program => {
  const consumed = consumeProgram(tokens, 0);
  if (!consumed || consumed.size !== tokens.length) {
    throw new TypeError(tokens[0].type);
  }

  return consumed.node;
};

export default parser;
