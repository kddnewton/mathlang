import { Nodes } from "./types";

export const add = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Add => ({ kind: "add", left, right, meta: {} });
export const call = (name: string, args: Nodes.Expr[]): Nodes.Call => ({ kind: "call", name, args, meta: {} });
export const define = (name: string, paramList: Nodes.ParamList, stmtList: Nodes.StmtList): Nodes.Define => ({ kind: "define", name, paramList, stmtList, meta: {} });
export const divide = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Divide => ({ kind: "divide", left, right, meta: {} });
export const exponentiate = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Exponentiate => ({ kind: "exponentiate", left, right, meta: {} });
export const getLocal = (name: string): Nodes.GetLocal => ({ kind: "getLocal", name, meta: {} });
export const modulo = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Modulo => ({ kind: "modulo", left, right, meta: {} });
export const multiply = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Multiply => ({ kind: "multiply", left, right, meta: {} });
export const negate = (value: Nodes.Expr): Nodes.Negate => ({ kind: "negate", value, meta: {} });
export const number = (value: number): Nodes.Number => ({ kind: "number", value, meta: {} });
export const param = (name: string): Nodes.Param => ({ kind: "param", name, meta: {} });
export const paramList = (params: Nodes.Param[]) => ({ kind: "paramList" as const, params, meta: {} });
export const program = (stmtList: Nodes.StmtList): Nodes.Program => ({ kind: "program", stmtList, meta: {} });
export const setLocal = (name: string, value: Nodes.Expr): Nodes.SetLocal => ({ kind: "setLocal", name, value, meta: {} });
export const stmtList = (stmts: Nodes.Stmt[]): Nodes.StmtList => ({ kind: "stmtList", stmts, meta: {} });
export const subtract = (left: Nodes.Expr, right: Nodes.Expr): Nodes.Subtract => ({ kind: "subtract", left, right, meta: {} });
