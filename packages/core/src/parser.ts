import { Nodes, Tokens } from "./types";
import { add, assign, call, define, divide, exponentiate, modulo, multiply, negate, number, param, paramList, program, stmtList, subtract, variable } from "./builders";

/**
 * Grammar:
 * 
 * Program -> StmtList
 * StmtList -> Stmt NewLine StmtList | Stmt
 * Stmt -> Assign | Define | Expr
 * Define -> Name LParen ParamList? RParen Equals LBrace NewLine StmtList RBrace
 *   | Name LParen ParamList? RParen Equals Stmt
 * ParamList -> Name (Comma ParamList)*
 * Assign -> Name Equals Expr
 * Expr -> Term ((Plus | Minus) Expr)*
 * Term -> Power ((Star | Slash) Term)*
 * Power -> Value (Caret Power)*
 * Value -> LParen Expr RParen | Minus Expr | Number Variable | Call | Variable | Number
 * Call -> Name LParen ArgList? RParen
 * ArgList -> Expr (Comma ArgList)*
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
const matchLParen = makeMatcher<Tokens.LParen>("(");
const matchRParen = makeMatcher<Tokens.RParen>(")");
const matchLBrace = makeMatcher<Tokens.LBrace>("{");
const matchRBrace = makeMatcher<Tokens.RBrace>("}");
const matchComma = makeMatcher<Tokens.Comma>(",");
const matchEquals = makeMatcher<Tokens.Equals>("=");
const matchPlus = makeMatcher<Tokens.Plus>("+");
const matchMinus = makeMatcher<Tokens.Minus>("-");
const matchStar = makeMatcher<Tokens.Star>("*");
const matchSlash = makeMatcher<Tokens.Slash>("/");
const matchPercent = makeMatcher<Tokens.Percent>("%");
const matchCaret = makeMatcher<Tokens.Caret>("^");

// Number
function consumeNumber(tokens: Tokens.All[], current: number): Consumed<Nodes.Number> {
  const token = tokens[current];

  if (matchNumber(token)) {
    return { node: number({ value: token.value, source: token.source }), size: 1 };
  }
  return null;
}

// Variable -> Name
function consumeGetLocal(tokens: Tokens.All[], current: number): Consumed<Nodes.Variable> {
  const token = tokens[current];

  if (matchName(token)) {
    return { node: variable({ name: token.value }), size: 1 };
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

// Call -> Name LParen ArgList? RParen
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
    node: call({ name: token.value, args: argList ? argList.node : [] }),
    size: argListSize + 3
  };
}

// Value -> LParen Expr RParen | Minus Expr | Number GetLocal | Call | GetLocal | Number
function consumeValue(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const firstToken = tokens[current];
  const secondToken = tokens[current + 1];

  if (matchLParen(firstToken)) {
    const consumed = consumeExpr(tokens, current + 1);

    if (consumed && matchRParen(tokens[current + 1 + consumed.size])) {
      return { node: consumed.node, size: consumed.size + 2 };
    }
  }

  if (matchMinus(firstToken)) {
    const consumed = consumeExpr(tokens, current + 1);

    if (consumed) {
      return { node: negate({ value: consumed.node }), size: 1 + consumed.size };
    }
  }

  if (matchNumber(firstToken) && matchName(secondToken)) {
    const node = multiply({
      left: number({ value: firstToken.value }),
      right: variable({ name: secondToken.value })
    });

    return { node, size: 2 };
  }

  return consumeCall(tokens, current) || consumeGetLocal(tokens, current) || consumeNumber(tokens, current);
};

// Power -> Value (Caret Power)*
function consumePower(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumeValue(tokens, current);
  if (!leftConsumed) {
    return null;
  }

  if (!matchCaret(tokens[current + leftConsumed.size])) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumePower, tokens, current + 1 + leftConsumed.size);

  return {
    node: exponentiate({ left: leftConsumed.node, right: rightConsumed.node }),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Term -> Power ((Star | Slash | Percent) Power)*
function consumeTerm(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumePower(tokens, current);
  if (!leftConsumed) {
    return null;
  }

  if (
    !matchStar(tokens[current + leftConsumed.size]) &&
    !matchSlash(tokens[current + leftConsumed.size]) &&
    !matchPercent(tokens[current + leftConsumed.size])
  ) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumeTerm, tokens, current + 1 + leftConsumed.size);
  let builder;

  switch (tokens[current + leftConsumed.size].kind) {
    case "*":
      builder = multiply;
      break;
    case "/":
      builder = divide;
      break;
    default:
      builder = modulo;
      break;
  }

  return {
    node: builder({ left: leftConsumed.node, right: rightConsumed.node }),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// Expr -> Term ((Plus | Minus) Expr)*
function consumeExpr(tokens: Tokens.All[], current: number): Consumed<Nodes.Expr> {
  const leftConsumed = consumeTerm(tokens, current);
  if (!leftConsumed) {
    return null;
  }

  if (!matchPlus(tokens[current + leftConsumed.size]) && !matchMinus(tokens[current + leftConsumed.size])) {
    return leftConsumed;
  }

  const rightConsumed = consume(consumeExpr, tokens, current + 1 + leftConsumed.size);
  const builder = tokens[current + leftConsumed.size].kind === "+" ? add : subtract;

  return {
    node: builder({ left: leftConsumed.node, right: rightConsumed.node }),
    size: leftConsumed.size + 1 + rightConsumed.size
  };
}

// ParamList -> Name Comma ParamList | Name
function consumeParamList(tokens: Tokens.All[], current: number): Consumed<Nodes.ParamList> {
  const token = tokens[current];

  if (!matchName(token)) {
    return null;
  }

  const params = [param({ name: token.value })];
  if (!matchComma(tokens[current + 1])) {
    return { node: paramList({ params }), size: 1 };
  }

  const nextConsumed = consume(consumeParamList, tokens, current + 2);
  return {
    node: paramList({ params: params.concat(nextConsumed.node.params) }),
    size: 2 + nextConsumed.size
  };
}

// Define -> Name LParen ParamList? RParen Equals LBrace NewLine StmtList RBrace
//   | Name LParen ParamList? RParen Equals Stmt
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
      node: define({ name: token.value, paramList: params ? params.node : paramList({ params: [] }), stmtList: body.node }),
      size: paramsSize + body.size + 7
    };
  }

  const body = consume(consumeStmt, tokens, current + 4 + paramsSize);
  const node = define({
    name: token.value,
    paramList: params ? params.node : paramList({ params: [] }),
    stmtList: stmtList({ stmts: [body.node] })
  });

  return { node, size: paramsSize + body.size + 4 };
}

// SetLocal -> Name Equals Expr
function consumeSetLocal(tokens: Tokens.All[], current: number): Consumed<Nodes.Assign> {
  const token = tokens[current];

  if (!matchName(token) || !matchEquals(tokens[current + 1])) {
    return null;
  }

  const consumed = consumeExpr(tokens, current + 2);
  if (!consumed) {
    return null;
  }

  return { node: assign({ name: token.value, value: consumed.node }), size: consumed.size + 2 };
}

// Stmt -> Define | SetLocal | Expr
function consumeStmt(tokens: Tokens.All[], current: number): Consumed<Nodes.Stmt> {
  return consumeDefine(tokens, current) || consumeSetLocal(tokens, current) || consumeExpr(tokens, current);
}

// StmtList -> Stmt NewLine StmtList | Stmt NewLine | Stmt | null
function consumeStmtList(tokens: Tokens.All[], current: number): Consumed<Nodes.StmtList> {
  const consumed = consumeStmt(tokens, current);
  if (!consumed) {
    return { node: stmtList({ stmts: [] }), size: 0 };
  }

  if (!matchNewLine(tokens[current + consumed.size])) {
    return { node: stmtList({ stmts: [consumed.node] }), size: consumed.size };
  }

  const nextStmtList = consume(consumeStmtList, tokens, current + consumed.size + 1);
  return {
    node: stmtList({ stmts: [consumed.node].concat(nextStmtList.node.stmts) }),
    size: consumed.size + 1 + nextStmtList.size
  };
}

// Program -> StmtList
function consumeProgram(tokens: Tokens.All[], current: number): Consumed<Nodes.Program> {
  const consumed = consume(consumeStmtList, tokens, current);
  return { node: program({ stmtList: consumed.node }), size: consumed.size };
}

const parser = (tokens: Tokens.All[]): Nodes.Program => {
  const consumed = consume(consumeProgram, tokens, 0);
  if (consumed.size !== tokens.length) {
    throw new TypeError(tokens[0].kind);
  }

  return consumed.node;
};

export default parser;
