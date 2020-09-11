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

export const optAdd = (left: Nodes.Expr, right: Nodes.Expr): Nodes.OptAdd => ({ type: "optAdd", left, right });
export const optSub = (left: Nodes.Expr, right: Nodes.Expr): Nodes.OptSub => ({ type: "optSub", left, right });
export const optMul = (left: Nodes.Expr, right: Nodes.Expr): Nodes.OptMul => ({ type: "optMul", left, right });
export const optDiv = (left: Nodes.Expr, right: Nodes.Expr): Nodes.OptDiv => ({ type: "optDiv", left, right });
export const optExp = (left: Nodes.Expr, right: Nodes.Expr): Nodes.OptExp => ({ type: "optExp", left, right });
