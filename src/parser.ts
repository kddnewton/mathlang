import { Nodes, Tokens } from "./types";
import { program, stmtList, getLocal, setLocal, number, add, sub, mul, div, exp, define, paramList, param, call } from "./builders";

/**
 * Grammar:
 * 
 * Program -> StmtList
 * StmtList -> Stmt NewLine StmtList | Stmt
 * Stmt -> Define | SetLocal | Expr
 * Define -> Name LParen RParen LBrace NewLine StmtList RBrace
 *   | Name LParen ParamList RParen LBrace NewLine StmtList RBrace
 * ParamList -> Name Comma ParamList | Name
 * SetLocal -> Name Equals Expr
 * Expr -> Term "+" Term | Term "-" Term | Term
 * Term -> Power "*" Power | Power "/" Power | Power
 * Power -> Value "^" Power | Value
 * Value -> LParen Expr RParen | Call | GetLocal | Number
 * Call -> Name LParen RParen |  Name LParen ArgList RParen
 * ArgList -> Expr Comma ArgList | Expr
 * GetLocal -> Name
 */

type SomeConsumed<T> = { node: T, size: number };
type Consumed<T> = SomeConsumed<T> | null;
type Consumer<T> = (tokens: Tokens.All[], current: number) => Consumed<T>;

function consume<T>(consumer: Consumer<T>, tokens: Tokens.All[], current: number): SomeConsumed<T> {
  const consumed = consumer(tokens, current);
  if (!consumed) {
    throw new TypeError(tokens[current] ? tokens[current].type : "EOF");
  }

  return consumed;
}

const makeMatcher = (type: string) => (tokens: Tokens.All[], index: number): boolean => {
  const token = tokens[index];
  return token && token.type === type;
};

const matchName = makeMatcher("name");
const matchNumber = makeMatcher("number");
const matchLParen = makeMatcher("lparen");
const matchRParen = makeMatcher("rparen");
const matchLBrace = makeMatcher("lbrace");
const matchRBrace = makeMatcher("rbrace");
const matchComma = makeMatcher("comma");
const matchEquals = makeMatcher("equals");

function matchOperator(tokens: Tokens.All[], index: number, ...values: string[]): boolean {
  const token = tokens[index];
  return token && token.type === "operator" && values.indexOf(token.value) > -1;
}

function matchNewLine(tokens: Tokens.All[], index: number): boolean {
  const token = tokens[index];
  return token && token.type === "newline";
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

// ArgList -> Expr Comma ArgList | Expr
function consumeArgList(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr[]> {
  const consumed = consumeExpr(tokens, current);
  if (!consumed) {
    return null;
  }

  if (!matchComma(tokens, current + consumed.size)) {
    return { node: [consumed.node], size: consumed.size };
  }

  const nextConsumed = consume(consumeArgList, tokens, current + consumed.size + 1);
  return {
    node: [consumed.node].concat(nextConsumed.node),
    size: consumed.size + 1 + nextConsumed.size
  };
}

// Call -> Name LParen RParen |  Name LParen ArgList RParen
function consumeCall(tokens: Tokens.All[], current: number): Consumed<Nodes.Call> {
  if (!matchName(tokens, current) || !matchLParen(tokens, current + 1)) {
    return null;
  }

  const argList = consumeArgList(tokens, current + 2);
  const argListSize = argList ? argList.size : 0;

  if (!matchRParen(tokens, current + 2 + argListSize)) {
    return null;
  }

  return {
    node: call((tokens[current] as Tokens.Name).value, argList ? argList.node : []),
    size: argListSize + 3
  };
}

// Value -> LParen Expr RParen | Call | GetLocal | Number
function consumeValue(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  if (matchLParen(tokens, current)) {
    const consumed = consumeExpr(tokens, current + 1);

    if (consumed && matchRParen(tokens, current + 1 + consumed.size)) {
      return { node: consumed.node, size: consumed.size + 2 };
    }
  }

  return consumeCall(tokens, current) || consumeGetLocal(tokens, current) || consumeNumber(tokens, current);
};

// Power -> Value "^" Power | Value
function consumePower(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumeValue(tokens, current);
  if (!leftConsumed) {
    return null;
  }

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
  const leftConsumed = consumePower(tokens, current);
  if (!leftConsumed) {
    return null;
  }

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
  const leftConsumed = consumeTerm(tokens, current);
  if (!leftConsumed) {
    return null;
  }

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

// ParamList -> Name Comma ParamList | Name
function consumeParamList(tokens: Tokens.All[], current: number): Consumed<Nodes.ParamList> {
  if (!matchName(tokens, current)) {
    return null;
  }

  const params = [param((tokens[current] as Tokens.Name).value)];
  if (!matchComma(tokens, current + 1)) {
    return { node: paramList(params), size: 1 };
  }

  const nextConsumed = consume(consumeParamList, tokens, current + 2);
  return {
    node: paramList(params.concat(nextConsumed.node.params)),
    size: 2 + nextConsumed.size
  };
}

// Define -> Name LParen RParen LBrace NewLine StmtList RBrace
//   | Name LParen ParamList RParen LBrace NewLine StmtList RBrace
function consumeDefine(tokens: Tokens.All[], current: number): Consumed<Nodes.Define> {
  if (!matchName(tokens, current) || !matchLParen(tokens, current + 1)) {
    return null;
  }

  const params = consumeParamList(tokens, current + 2);
  const paramsSize = params ? params.size : 0;

  if (
    !matchRParen(tokens, current + 2 + paramsSize) ||
    !matchLBrace(tokens, current + 3 + paramsSize) ||
    !matchNewLine(tokens, current + 4 + paramsSize)
  ) {
    return null;
  }

  const body = consume(consumeStmtList, tokens, current + 5 + paramsSize);

  if (!matchRBrace(tokens, current + 5 + paramsSize + body.size)) {
    return null;
  }

  return {
    node: define((tokens[current] as Tokens.Name).value, params ? params.node : paramList([]), body.node),
    size: paramsSize + body.size + 6
  };
}

// SetLocal -> Name Equals Expr
function consumeSetLocal(tokens: Tokens.All[], current: number): Consumed<Nodes.SetLocal> {
  if (!matchName(tokens, current) || !matchEquals(tokens, current + 1)) {
    return null;
  }

  const consumed = consumeExpr(tokens, current + 2);
  if (!consumed) {
    return null;
  }

  return {
    node: setLocal((tokens[current] as Tokens.Name).value, consumed.node),
    size: consumed.size + 2
  };
}

// Stmt -> Define | SetLocal | Expr
function consumeStmt(tokens: Tokens.All[], current: number): Consumed<Nodes.Stmt> {
  return consumeDefine(tokens, current) || consumeSetLocal(tokens, current) || consumeExpr(tokens, current);
}

// StmtList -> Stmt NewLine StmtList | Stmt NewLine | Stmt | null
function consumeStmtList(tokens: Tokens.All[], current: number): Consumed<Nodes.StmtList> {
  const consumed = consumeStmt(tokens, current);
  if (!consumed) {
    return { node: stmtList([]), size: 0 };
  }

  if (!matchNewLine(tokens, current + consumed.size)) {
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
