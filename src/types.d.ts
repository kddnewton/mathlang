export declare namespace Tokens {
  type Comma = { type: "comma" };
  type Equals = { type: "equals" };
  type LBrace = { type: "lbrace" };
  type LParen = { type: "lparen" };
  type Minus = { type: "minus" };
  type Mod = { type: "mod" };
  type Name = { type: "name", value: string };
  type NewLine = { type: "newline" };
  type Number = { type: "number", value: number };
  type Over = { type: "over" };
  type Plus = { type: "plus" };
  type RBrace = { type: "rbrace" };
  type RParen = { type: "rparen" };
  type Times = { type: "times" };
  type ToThe = { type: "tothe" };

  type Symbol = Comma | Equals | LBrace | LParen | RBrace | RParen;
  type Operator = Minus | Mod | Over | Plus | Times | ToThe;
  type All = Name | NewLine | Number | Operator | Symbol;
}

export declare namespace Nodes {
  type Meta = { [key: string]: any };
  type Node<T> = T & { meta: Meta };

  type Add = Node<{ type: "add", left: Expr, right: Expr }>;
  type Call = Node<{ type: "call", name: string, args: Expr[] }>;
  type Define = Node<{ type: "define", name: string, paramList: ParamList, stmtList: StmtList }>;
  type Divide = Node<{ type: "divide", left: Expr, right: Expr }>;
  type Exponentiate = Node<{ type: "exponentiate", left: Expr, right: Expr }>;
  type GetLocal = Node<{ type: "getLocal", name: string }>;
  type Modulo = Node<{ type: "modulo", left: Expr, right: Expr }>;
  type Multiply = Node<{ type: "multiply", left: Expr, right: Expr }>;
  type Number = Node<{ type: "number", value: number }>;
  type Param = Node<{ type: "param", name: string }>;
  type ParamList = Node<{ type: "paramList", params: Param[] }>;
  type Program = Node<{ type: "program", stmtList: StmtList }>;
  type SetLocal = Node<{ type: "setLocal", name: string, value: Expr }>;
  type StmtList = Node<{ type: "stmtList", stmts: Stmt[] }>;
  type Subtract = Node<{ type: "subtract", left: Expr, right: Expr }>;

  type Binary = Add | Subtract | Multiply | Divide | Exponentiate | Modulo;
  type Expr = Binary | Call | GetLocal | Number;
  type Stmt = Define | Expr | SetLocal;

  type All = Stmt | StmtList | Program;
}

export declare namespace Insns {
  type Add = { type: "add" };
  type Call = { type: "call" };
  type Define = { type: "define" };
  type Divide = { type: "divide" };
  type Exponentiate = { type: "exponentiate" };
  type GetLocal = { type: "getLocal" };
  type Modulo = { type: "modulo" };
  type Multiply = { type: "multiply" };
  type SetLocal = { type: "setLocal" };
  type Subtract = { type: "subtract" };
  
  type Binary = Add | Subtract | Multiply | Divide | Exponentiate | Modulo;
  type Operation = Binary | Call | Define | GetLocal | SetLocal;
  type Operand = string | number;

  type All = Operation | Operand | All[];
}
