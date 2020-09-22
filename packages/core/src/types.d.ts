export declare namespace Tokens {
  type Loc = { line: number, col: number, pos: number };
  type Token<K, V = undefined> = { kind: K, loc: Loc } & (V extends undefined ? {} : { value: V });

  type Comma = Token<"comma">;
  type Equals = Token<"equals">;
  type LBrace = Token<"lbrace">;
  type LParen = Token<"lparen">;
  type Minus = Token<"minus">;
  type Mod = Token<"mod">;
  type Name = Token<"name", string>;
  type NewLine = Token<"newline">;
  type Number = Token<"number", number>;
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
  type Call = Node<"call", { name: string, args: Expr[] }>;
  type Define = Node<"define", { name: string, paramList: ParamList, stmtList: StmtList }>;
  type Divide = Node<"divide", { left: Expr, right: Expr }>;
  type Exponentiate = Node<"exponentiate", { left: Expr, right: Expr }>;
  type GetLocal = Node<"getLocal", { name: string }>;
  type Modulo = Node<"modulo", { left: Expr, right: Expr }>;
  type Multiply = Node<"multiply", { left: Expr, right: Expr }>;
  type Negate = Node<"negate", { value: Expr }>;
  type Number = Node<"number", { value: number }>;
  type Param = Node<"param", { name: string }>;
  type ParamList = Node<"paramList", { params: Param[] }>;
  type Program = Node<"program", { stmtList: StmtList }>;
  type SetLocal = Node<"setLocal", { name: string, value: Expr }>;
  type StmtList = Node<"stmtList", { stmts: Stmt[] }>;
  type Subtract = Node<"subtract", { left: Expr, right: Expr }>;

  type Binary = Add | Subtract | Multiply | Divide | Exponentiate | Modulo;
  type Expr = Binary | Call | GetLocal | Negate | Number;
  type Stmt = Define | Expr | SetLocal;

  type All = Stmt | StmtList | Program;
}

export declare namespace Insns {
  type Insn<K> = { kind: K };

  type Add = Insn<"add">;
  type Call = Insn<"call">;
  type Define = Insn<"define">;
  type Divide = Insn<"divide">;
  type Exponentiate = Insn<"exponentiate">;
  type GetLocal = Insn<"getLocal">;
  type Modulo = Insn<"modulo">;
  type Multiply = Insn<"multiply">;
  type Negate = Insn<"negate">;
  type SetLocal = Insn<"setLocal">;
  type Subtract = Insn<"subtract">;
  
  type Binary = Add | Subtract | Multiply | Divide | Exponentiate | Modulo;
  type Operation = Binary | Call | Define | GetLocal | Negate | SetLocal;
  type Operand = string | number;

  type All = Operation | Operand | All[];
}
