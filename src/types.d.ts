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

  type Expr = Call | GetLocal | Number;
  type Stmt = Define | Expr | SetLocal;

  type All = Stmt | StmtList | Program;
}

export declare namespace Tokens {
  type NewLine = { type: "newline" };

  type Symbol = { type: "symbol", value: "(" | ")" | "{" | "}" | "," | "=" };
  type Operator = { type: "operator", value: "+" | "-" | "*" | "/" | "^" };

  type Number = { type: "number", value: number };
  type Name = { type: "name", value: string };

  type All = NewLine | Symbol | Operator | Number | Name;
}
