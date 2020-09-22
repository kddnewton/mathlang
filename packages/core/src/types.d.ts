export declare namespace Tokens {
  type Loc = { line: number, col: number, pos: number };
  type Token<K, V = undefined> = { kind: K, loc: Loc } & (V extends undefined ? {} : V);

  type Comma = Token<"comma">;
  type Equals = Token<"equals">;
  type LBrace = Token<"lbrace">;
  type LParen = Token<"lparen">;
  type Minus = Token<"minus">;
  type Mod = Token<"mod">;
  type Name = Token<"name", { value: string }>;
  type NewLine = Token<"newline">;
  type Number = Token<"number", { value: number, source: string }>;
  type Over = Token<"over">;
  type Plus = Token<"plus">;
  type RBrace = Token<"rbrace">;
  type RParen = Token<"rparen">;
  type Times = Token<"times">;
  type ToThe = Token<"tothe">;

  type Symbol = Comma | Equals | LBrace | LParen | RBrace | RParen;
  type Operator = Minus | Mod | Over | Plus | Times | ToThe;
  type All = Name | NewLine | Number | Operator | Symbol;
}

export declare namespace Nodes {
  type Meta = { [key: string]: any };
  type Node<K, V> = { kind: K, meta: Meta } & V;

  type Add = Node<"add", { left: Expr, right: Expr }>;
  type Assign = Node<"assign", { name: string, value: Expr }>;
  type Call = Node<"call", { name: string, args: Expr[] }>;
  type Define = Node<"define", { name: string, paramList: ParamList, stmtList: StmtList }>;
  type Divide = Node<"divide", { left: Expr, right: Expr }>;
  type Exponentiate = Node<"exponentiate", { left: Expr, right: Expr }>;
  type Modulo = Node<"modulo", { left: Expr, right: Expr }>;
  type Multiply = Node<"multiply", { left: Expr, right: Expr }>;
  type Negate = Node<"negate", { value: Expr }>;
  type Number = Node<"number", { source?: string, value: number }>;
  type Param = Node<"param", { name: string }>;
  type ParamList = Node<"paramList", { params: Param[] }>;
  type Program = Node<"program", { stmtList: StmtList }>;
  type StmtList = Node<"stmtList", { stmts: Stmt[] }>;
  type Subtract = Node<"subtract", { left: Expr, right: Expr }>;
  type Variable = Node<"variable", { name: string }>;

  type Binary = Add | Subtract | Multiply | Divide | Exponentiate | Modulo;
  type Expr = Binary | Call | Negate | Number | Variable;
  type Stmt = Assign | Define | Expr;

  type All = Stmt | StmtList | Program;
}

export declare namespace Insns {
  type Insn<K> = { kind: K };

  type Add = Insn<"add">;
  type Assign = Insn<"assign">;
  type Call = Insn<"call">;
  type Define = Insn<"define">;
  type Divide = Insn<"divide">;
  type Exponentiate = Insn<"exponentiate">;
  type Modulo = Insn<"modulo">;
  type Multiply = Insn<"multiply">;
  type Negate = Insn<"negate">;
  type Subtract = Insn<"subtract">;
  type Variable = Insn<"variable">;

  type Binary = Add | Subtract | Multiply | Divide | Exponentiate | Modulo;
  type Operation = Assign | Binary | Call | Define | Negate | Variable;
  type Operand = string | number;

  type All = Operation | Operand | All[];
}
