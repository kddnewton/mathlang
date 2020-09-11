export declare namespace Tokens {
  type NewLine = { type: "newline" };

  type LParen = { type: "lparen" };
  type RParen = { type: "rparen" };
  type LBrace = { type: "lbrace" };
  type RBrace = { type: "rbrace" };
  type Comma = { type: "comma" };
  type Equals = { type: "equals" };

  type Plus = { type: "plus" };
  type Minus = { type: "minus" };
  type Times = { type: "times" };
  type Over = { type: "over" };
  type ToThe = { type: "tothe" };

  type Number = { type: "number", value: number };
  type Name = { type: "name", value: string };

  type Symbol = LParen | RParen | LBrace | RBrace | Comma | Equals;
  type Operator = Plus | Minus | Times | Over | ToThe;
  type All = NewLine | Symbol | Operator | Number | Name;
}

export declare namespace Nodes {
  type Number = { type: "number", value: number };

  type GetLocal = { type: "getLocal", name: string };
  type SetLocal = { type: "setLocal", name: string, value: Expr };

  type Call = { type: "call", name: string, args: Expr[] };
  type Define = { type: "define", name: string, paramList: ParamList, stmtList: StmtList };

  type Param = { type: "param", name: string };
  type ParamList = { type: "paramList", params: Param[] };

  type StmtList = { type: "stmtList", stmts: Stmt[] };
  type Program = { type: "program", stmtList: StmtList };

  type OptAdd = { type: "optAdd", left: Expr, right: Expr };
  type OptSub = { type: "optSub", left: Expr, right: Expr };
  type OptMul = { type: "optMul", left: Expr, right: Expr };
  type OptDiv = { type: "optDiv", left: Expr, right: Expr };
  type OptExp = { type: "optExp", left: Expr, right: Expr };
  type Opt = OptAdd | OptSub | OptMul | OptDiv | OptExp;

  type Expr = Opt | Call | GetLocal | Number;
  type Stmt = Define | Expr | SetLocal;

  type All = Stmt | StmtList | Program;
}

export declare namespace Insns {
  type Operand = string | number;

  type Call = { type: "call" };
  type Define = { type: "define" };
  type GetLocal = { type: "getLocal" };
  type SetLocal = { type: "setLocal" };

  type OptAdd = { type: "optAdd" };
  type OptSub = { type: "optSub" };
  type OptMul = { type: "optMul" };
  type OptDiv = { type: "optDiv" };
  type OptExp = { type: "optExp" };
  type Opt = OptAdd | OptSub | OptMul | OptDiv | OptExp;

  type Operation = Opt | Call | Define | GetLocal | SetLocal;
  type All = Operand | Operation | All[];
}
