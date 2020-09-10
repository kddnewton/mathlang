import { Nodes } from "./types";

export const number = (value: number): Nodes.Number => ({ type: "number", value });

export const getLocal = (name: string): Nodes.GetLocal => ({ type: "getLocal", name });
export const setLocal = (name: string, value: Nodes.Expr): Nodes.SetLocal => ({ type: "setLocal", name, value });

export const call = (name: string, args: Nodes.Expr[]): Nodes.Call => ({ type: "call", name, args });
export const define = (name: string, paramList: Nodes.ParamList, stmtList: Nodes.StmtList): Nodes.Define => ({ type: "define", name, paramList, stmtList });

export const param = (name: string): Nodes.Param => ({ type: "param", name });
export const paramList = (params: Nodes.Param[]) => ({ type: "paramList" as const, params });

export const stmtList = (stmts: Nodes.Stmt[]): Nodes.StmtList => ({ type: "stmtList", stmts });
export const program = (stmtList: Nodes.StmtList): Nodes.Program => ({ type: "program", stmtList });

// Higher-level AST node builders, could be used for further optimizations
const unary = (name: string) => (value: Nodes.Expr): Nodes.Call => call(name, [value]);
const binary = (name: string) => (left: Nodes.Expr, right: Nodes.Expr): Nodes.Call => call(name, [left, right]);

export const neg = unary("neg");
export const add = binary("add");
export const sub = binary("sub");
export const mul = binary("mul");
export const div = binary("div");
export const exp = binary("exp");
