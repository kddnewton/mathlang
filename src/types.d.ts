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
  type Mod = { type: "mod" };

  type Number = { type: "number", value: number };
  type Name = { type: "name", value: string };

  type Symbol = LParen | RParen | LBrace | RBrace | Comma | Equals;
  type Operator = Plus | Minus | Times | Over | ToThe | Mod;
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

  type Add = { type: "add", left: Expr, right: Expr };
  type Sub = { type: "sub", left: Expr, right: Expr };
  type Mul = { type: "mul", left: Expr, right: Expr };
  type Div = { type: "div", left: Expr, right: Expr };
  type Exp = { type: "exp", left: Expr, right: Expr };
  type Mod = { type: "mod", left: Expr, right: Expr };

  type Binary = Add | Sub | Mul | Div | Exp | Mod;
  type Expr = Binary | Call | GetLocal | Number;
  type Stmt = Define | Expr | SetLocal;

  type All = Stmt | StmtList | Program;
}

export declare namespace Insns {
  type Operand = string | number;

  type Call = { type: "call" };
  type Define = { type: "define" };
  type GetLocal = { type: "getLocal" };
  type SetLocal = { type: "setLocal" };
  type Add = { type: "add" };
  type Sub = { type: "sub" };
  type Mul = { type: "mul" };
  type Div = { type: "div" };
  type Exp = { type: "exp" };
  type Mod = { type: "mod" };

  type Binary = Add | Sub | Mul | Div | Exp | Mod;
  type Operation = Binary | Call | Define | GetLocal | SetLocal;
  type All = Operand | Operation | All[];
}
