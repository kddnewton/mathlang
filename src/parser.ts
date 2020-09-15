import { Nodes, Tokens } from "./types";
import { add, call, define, divide, exponentiate, getLocal, modulo, multiply, number, param, paramList, program, setLocal, stmtList, subtract } from "./builders";

/**
 * Grammar:
 * 
 * Program -> StmtList
 * StmtList -> Stmt NewLine StmtList | Stmt
 * Stmt -> Define | SetLocal | Expr
 * Define -> Name LParen RParen Equals LBrace NewLine StmtList RBrace
 *   | Name LParen ParamList RParen Equals LBrace NewLine StmtList RBrace
 *   | Name LParen ParamList RParen Equals Stmt
 *   | Name LParen RParen Equals Stmt
 * ParamList -> Name Comma ParamList | Name
 * SetLocal -> Name Equals Expr
 * Expr -> Term Plus Term | Term Minus Term | Term
 * Term -> Power Times Power | Power Over Power | Power Mod Power | Power
 * Power -> Value ToThe Power | Value
 * Value -> LParen Expr RParen | Number GetLocal | Call | GetLocal | Number
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
    throw new TypeError(tokens[current] ? tokens[current].kind : "EOF");
  }

  return consumed;
}

const makeMatcher = <T extends Tokens.All>(type: T["kind"]) => (token: Tokens.All | undefined): token is T => {
  return token ? token.kind === type : false;
};

const matchNewLine = makeMatcher<Tokens.NewLine>("newline");
const matchName = makeMatcher<Tokens.Name>("name");
const matchNumber = makeMatcher<Tokens.Number>("number");
const matchLParen = makeMatcher<Tokens.LParen>("lparen");
const matchRParen = makeMatcher<Tokens.RParen>("rparen");
const matchLBrace = makeMatcher<Tokens.LBrace>("lbrace");
const matchRBrace = makeMatcher<Tokens.RBrace>("rbrace");
const matchComma = makeMatcher<Tokens.Comma>("comma");
const matchEquals = makeMatcher<Tokens.Equals>("equals");
const matchPlus = makeMatcher<Tokens.Plus>("plus");
const matchMinus = makeMatcher<Tokens.Minus>("minus");
const matchTimes = makeMatcher<Tokens.Times>("times");
const matchOver = makeMatcher<Tokens.Over>("over");
const matchMod = makeMatcher<Tokens.Mod>("mod");
const matchToThe = makeMatcher<Tokens.ToThe>("tothe");

// Number
function consumeNumber(tokens: Tokens.All[], current: number): Consumed<Nodes.Number> {
  const token = tokens[current];

  if (matchNumber(token)) {
    return { node: number(token.value), size: 1 };
  }
  return null;
}

// GetLocal -> Name
function consumeGetLocal(tokens: Tokens.All[], current: number): Consumed<Nodes.GetLocal> {
  const token = tokens[current];

  if (matchName(token)) {
    return { node: getLocal(token.value), size: 1 };
  }
  return null;
}

// ArgList -> Expr Comma ArgList | Expr
function consumeArgList(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr[]> {
  const consumed = consumeExpr(tokens, current);
  if (!consumed) {
    return null;
  }

  if (!matchComma(tokens[current + consumed.size])) {
    return { node: [consumed.node], size: consumed.size };
  }

  const nextConsumed = consume(consumeArgList, tokens, current + consumed.size + 1);
  return {
    node: [consumed.node].concat(nextConsumed.node),
    size: consumed.size + 1 + nextConsumed.size
  };
}

// Call -> Name LParen RParen | Name LParen ArgList RParen
function consumeCall(tokens: Tokens.All[], current: number): Consumed<Nodes.Call> {
  const token = tokens[current];

  if (!matchName(token) || !matchLParen(tokens[current + 1])) {
    return null;
  }

  const argList = consumeArgList(tokens, current + 2);
  const argListSize = argList ? argList.size : 0;

  if (!matchRParen(tokens[current + 2 + argListSize])) {
    return null;
  }

  return {
    node: call(token.value, argList ? argList.node : []),
    size: argListSize + 3
  };
}

// Value -> LParen Expr RParen | Number GetLocal | Call | GetLocal | Number
function consumeValue(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const firstToken = tokens[current];
  const secondToken = tokens[current + 1];

  if (matchLParen(firstToken)) {
    const consumed = consumeExpr(tokens, current + 1);

    if (consumed && matchRParen(tokens[current + 1 + consumed.size])) {
      return { node: consumed.node, size: consumed.size + 2 };
    }
  }

  if (matchNumber(firstToken) && matchName(secondToken)) {
    return { node: multiply(number(firstToken.value), getLocal(secondToken.value)), size: 2 };
  }

  return consumeCall(tokens, current) || consumeGetLocal(tokens, current) || consumeNumber(tokens, current);
};

// Power -> Value ToThe Power | Value
function consumePower(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumeValue(tokens, current);
  if (!leftConsumed) {
    return null;
  }

  if (!matchToThe(tokens[current + leftConsumed.size])) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumePower, tokens, current + 1 + leftConsumed.size);

  return {
    node: exponentiate(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Term -> Power Times Power | Power Over Power | Power Mod Power | Power
function consumeTerm(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumePower(tokens, current);
  if (!leftConsumed) {
    return null;
  }

  if (
    !matchTimes(tokens[current + leftConsumed.size]) &&
    !matchOver(tokens[current + leftConsumed.size]) &&
    !matchMod(tokens[current + leftConsumed.size])
  ) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumePower, tokens, current + 1 + leftConsumed.size);
  let builder;

  switch (tokens[current + leftConsumed.size].kind) {
    case "times":
      builder = multiply;
      break;
    case "over":
      builder = divide;
      break;
    default:
      builder = modulo;
      break;
  }

  return {
    node: builder(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Expr -> Term Plus Term | Term Minus Term | Term
function consumeExpr(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumeTerm(tokens, current);
  if (!leftConsumed) {
    return null;
  }

  if (!matchPlus(tokens[current + leftConsumed.size]) && !matchMinus(tokens[current + leftConsumed.size])) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumeTerm, tokens, current + 1 + leftConsumed.size);
  const builder = tokens[current + leftConsumed.size].kind === "plus" ? add : subtract;

  return {
    node: builder(leftConsumed.node, rightConsumed.node),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// ParamList -> Name Comma ParamList | Name
function consumeParamList(tokens: Tokens.All[], current: number): Consumed<Nodes.ParamList> {
  const token = tokens[current];

  if (!matchName(token)) {
    return null;
  }

  const params = [param(token.value)];
  if (!matchComma(tokens[current + 1])) {
    return { node: paramList(params), size: 1 };
  }

  const nextConsumed = consume(consumeParamList, tokens, current + 2);
  return {
    node: paramList(params.concat(nextConsumed.node.params)),
    size: 2 + nextConsumed.size
  };
}

// Define -> Name LParen RParen Equals LBrace NewLine StmtList RBrace
//   | Name LParen ParamList RParen Equals LBrace NewLine StmtList RBrace
//   | Name LParen ParamList RParen Equals Stmt
//   | Name LParen RParen Equals Stmt
function consumeDefine(tokens: Tokens.All[], current: number): Consumed<Nodes.Define> {
  const token = tokens[current];

  if (!matchName(token) || !matchLParen(tokens[current + 1])) {
    return null;
  }

  const params = consumeParamList(tokens, current + 2);
  const paramsSize = params ? params.size : 0;

  if (!matchRParen(tokens[current + 2 + paramsSize]) || !matchEquals(tokens[current + 3 + paramsSize])) {
    return null;
  }

  if (matchLBrace(tokens[current + 4 + paramsSize])) {
    if (!matchNewLine(tokens[current + 5 + paramsSize])) {
      return null;
    }

    const body = consume(consumeStmtList, tokens, current + 6 + paramsSize);
    if (!matchRBrace(tokens[current + 6 + paramsSize + body.size])) {
      return null;
    }
  
    return {
      node: define(token.value, params ? params.node : paramList([]), body.node),
      size: paramsSize + body.size + 7
    };
  }

  const body = consume(consumeStmt, tokens, current + 4 + paramsSize);
  return {
    node: define(token.value, params ? params.node : paramList([]), stmtList([body.node])),
    size: paramsSize + body.size + 4
  };
}

// SetLocal -> Name Equals Expr
function consumeSetLocal(tokens: Tokens.All[], current: number): Consumed<Nodes.SetLocal> {
  const token = tokens[current];

  if (!matchName(token) || !matchEquals(tokens[current + 1])) {
    return null;
  }

  const consumed = consumeExpr(tokens, current + 2);
  if (!consumed) {
    return null;
  }

  return { node: setLocal(token.value, consumed.node), size: consumed.size + 2 };
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

  if (!matchNewLine(tokens[current + consumed.size])) {
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
    throw new TypeError(tokens[0].kind);
  }

  return consumed.node;
};

export default parser;
