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

export const add = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Add => ({ type: "add", left, right });
export const sub = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Sub => ({ type: "sub", left, right });
export const mul = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Mul => ({ type: "mul", left, right });
export const div = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Div => ({ type: "div", left, right });
export const exp = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Exp => ({ type: "exp", left, right });
