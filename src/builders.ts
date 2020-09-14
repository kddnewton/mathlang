import { Nodes } from "./types";

export const add = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Add => ({ type: "add", left, right, meta: {} });
export const call = (name: string, args: Nodes.Expr[]): Nodes.Call => ({ type: "call", name, args, meta: {} });
export const define = (name: string, paramList: Nodes.ParamList, stmtList: Nodes.StmtList): Nodes.Define => ({ type: "define", name, paramList, stmtList, meta: {} });
export const divide = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Divide => ({ type: "divide", left, right, meta: {} });
export const exponentiate = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Exponentiate => ({ type: "exponentiate", left, right, meta: {} });
export const getLocal = (name: string): Nodes.GetLocal => ({ type: "getLocal", name, meta: {} });
export const modulo = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Modulo => ({ type: "modulo", left, right, meta: {} });
export const multiply = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Multiply => ({ type: "multiply", left, right, meta: {} });
export const number = (value: number): Nodes.Number => ({ type: "number", value, meta: {} });
export const param = (name: string): Nodes.Param => ({ type: "param", name, meta: {} });
export const paramList = (params: Nodes.Param[]) => ({ type: "paramList" as const, params, meta: {} });
export const program = (stmtList: Nodes.StmtList): Nodes.Program => ({ type: "program", stmtList, meta: {} });
export const setLocal = (name: string, value: Nodes.Expr): Nodes.SetLocal => ({ type: "setLocal", name, value, meta: {} });
export const stmtList = (stmts: Nodes.Stmt[]): Nodes.StmtList => ({ type: "stmtList", stmts, meta: {} });
export const subtract = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Subtract => ({ type: "subtract", left, right, meta: {} });
