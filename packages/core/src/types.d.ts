export declare namespace Tokens {
  type Loc = { line: number, col: number, pos: number };
  type Token<K, V = undefined> = { kind: K, loc: Loc } & (V extends undefined ? {} : V);

  type Plus = Token<"+">;
  type Minus = Token<"-">;
  type Star = Token<"*">;
  type Slash = Token<"/">;
  type Percent = Token<"%">;
  type Caret = Token<"^">;
  type Operator = Plus | Minus | Star | Slash | Percent| Caret;
  
  type Comma = Token<",">;
  type Equals = Token<"=">;
  type LBrace = Token<"{">;
  type RBrace = Token<"}">;
  type LParen = Token<"(">;
  type RParen = Token<")">;
  type Symbol = Comma | Equals | LBrace | RBrace | LParen | RParen;
  
  type Name = Token<"name", { value: string }>;
  type NewLine = Token<"newline">;
  type Number = Token<"number", { value: number, source: string }>;

  type All = Operator | Symbol | Name | NewLine | Number;
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
