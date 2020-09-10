import { Nodes, Tokens } from "./types";
import { program, stmtList, getLocal, setLocal, number, add, sub, mul, div, exp } from "./builders";

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
 * Value -> "(" Expr ")" | GetLocal | Number
 * GetLocal -> Name
 */

type SomeConsumed<T> = { node: T, size: number };
type Consumed<T> = SomeConsumed<T> | null;
type Consumer<T> = (tokens: Tokens.All[], current: number) => Consumed<T>;

function consume<T>(consumer: Consumer<T>, tokens: Tokens.All[], current: number): SomeConsumed<T> {
  const consumed = consumer(tokens, current);
  if (!consumed) {
    throw new TypeError(tokens[current].type);
  }

  return consumed;
}

function matchName(tokens: Tokens.All[], index: number): boolean {
  const token = tokens[index];
  return token && token.type === "name";
}

function matchNumber(tokens: Tokens.All[], index: number): boolean {
  const token = tokens[index];
  return token && token.type === "number";
}

function matchSymbol(tokens: Tokens.All[], index: number, value: string): boolean {
  const token = tokens[index];
  return token && token.type === "symbol" && token.value === value;
}

function matchOperator(tokens: Tokens.All[], index: number, ...values: string[]): boolean {
  const token = tokens[index];
  return token && token.type === "operator" && values.indexOf(token.value) > -1;
}

// Number
function consumeNumber(tokens: Tokens.All[], current: number): Consumed<Nodes.Number> {
  if (matchNumber(tokens, current)) {
    return { node: number((tokens[current] as Tokens.Number).value), size: 1 };
  }
  return null;
}

// GetLocal -> Name
function consumeGetLocal(tokens: Tokens.All[], current: number): Consumed<Nodes.GetLocal> {
  if (matchName(tokens, current)) {
    return { node: getLocal((tokens[current] as Tokens.Name).value), size: 1 };
  }
  return null;
}

// Value -> "(" Expr ")" | GetLocal | Number
function consumeValue(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  if (matchSymbol(tokens, current, "(")) {
    const consumed = consumeExpr(tokens, current + 1);

    if (consumed && matchSymbol(tokens, current + 1 + consumed.size, ")")) {
      return { node: consumed.node, size: consumed.size + 2 };
    }
  }

  return consumeGetLocal(tokens, current) || consumeNumber(tokens, current);
};

// Power -> Value "^" Power | Value
function consumePower(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consume(consumeValue, tokens, current);

  if (!matchOperator(tokens, current + leftConsumed.size, "^")) {
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
  const leftConsumed = consume(consumePower, tokens, current);
  if (!matchOperator(tokens, current + leftConsumed.size, "*", "/")) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumePower, tokens, current + 1 + leftConsumed.size);
  const builder = (tokens[current + leftConsumed.size] as Tokens.Operator).value === "*" ? mul : div;

  return {
    node: builder(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Expr -> Term "+" Term | Term "-" Term | Term
function consumeExpr(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consume(consumeTerm, tokens, current);
  if (!matchOperator(tokens, current + leftConsumed.size, "+", "-")) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumeTerm, tokens, current + 1 + leftConsumed.size);
  const builder = (tokens[current + leftConsumed.size] as Tokens.Operator).value === "+" ? add : sub;

  return {
    node: builder(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// ParamList -> Name "," ParamList | Name
function consumeParamList(tokens: Tokens.All[], current: number): Consumed<Nodes.ParamList> {
  return null;
}

// Define -> Name "(" ")" "{" StmtList "}" | Name "(" ParamList ")" "{" StmtList "}"
function consumeDefine(tokens: Tokens.All[], current: number): Consumed<Nodes.Define> {
  return null;
}

// SetLocal -> Name "=" Expr
function consumeSetLocal(tokens: Tokens.All[], current: number): Consumed<Nodes.SetLocal> {
  const token = tokens[current];
  if (token.type !== "name" || !matchSymbol(tokens, current + 1, "=")) {
    return null;
  }

  const consumed = consumeExpr(tokens, current + 2);
  if (!consumed) {
    return null;
  }

  return {
    node: setLocal(token.value, consumed.node),
    size: consumed.size + 2
  };
}

// Stmt -> Define | SetLocal | Expr
function consumeStmt(tokens: Tokens.All[], current: number): Consumed<Nodes.Stmt> {
  return consumeDefine(tokens, current) || consumeSetLocal(tokens, current) || consumeExpr(tokens, current);
}

// StmtList -> Stmt "\n" StmtList | Stmt
function consumeStmtList(tokens: Tokens.All[], current: number): Consumed<Nodes.StmtList> {
  const consumed = consume(consumeStmt, tokens, current);
  const nextToken = tokens[current + consumed.size];

  if (!nextToken || nextToken.type !== "newline") {
    return { node: stmtList([consumed.node]), size: consumed.size };
  }

  const nextStmtList = consume(consumeStmtList, tokens, current + consumed.size + 1);
  return {
    node: stmtList([consumed.node].concat(nextStmtList.node.stmts)),
    size: consumed.size + 1 + nextStmtList.size
  };
}

// Program -> StmtList
function consumeProgram(tokens: Tokens.All[], current: number): Consumed<Nodes.Program> {
  const consumed = consume(consumeStmtList, tokens, current);
  return { node: program(consumed.node), size: consumed.size };
}

const parser = (tokens: Tokens.All[]): Nodes.Program => {
  const consumed = consume(consumeProgram, tokens, 0);
  if (consumed.size !== tokens.length) {
    throw new TypeError(tokens[0].type);
  }

  return consumed.node;
};

export default parser;
