import { Nodes } from "./types";

export const add = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Add => ({ type: "add", left, right });
export const call = (name: string, args: Nodes.Expr[]): Nodes.Call => ({ type: "call", name, args });
export const define = (name: string, paramList: Nodes.ParamList, stmtList: Nodes.StmtList): Nodes.Define => ({ type: "define", name, paramList, stmtList });
export const divide = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Divide => ({ type: "divide", left, right });
export const exponentiate = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Exponentiate => ({ type: "exponentiate", left, right });
export const getLocal = (name: string): Nodes.GetLocal => ({ type: "getLocal", name });
export const modulo = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Modulo => ({ type: "modulo", left, right });
export const multiply = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Multiply => ({ type: "multiply", left, right });
export const number = (value: number): Nodes.Number => ({ type: "number", value });
export const param = (name: string): Nodes.Param => ({ type: "param", name });
export const paramList = (params: Nodes.Param[]) => ({ type: "paramList" as const, params });
export const program = (stmtList: Nodes.StmtList): Nodes.Program => ({ type: "program", stmtList });
export const setLocal = (name: string, value: Nodes.Expr): Nodes.SetLocal => ({ type: "setLocal", name, value });
export const stmtList = (stmts: Nodes.Stmt[]): Nodes.StmtList => ({ type: "stmtList", stmts });
export const subtract = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Subtract => ({ type: "subtract", left, right });
