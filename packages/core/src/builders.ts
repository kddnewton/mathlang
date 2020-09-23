import { Nodes } from "./types";

type Builder<T> = (opts: Omit<T, "kind" | "meta">) => T;

export const add: Builder<Nodes.Add> = ({ left, right }) => ({ kind: "add", left, right, meta: {} });
export const assign: Builder<Nodes.Assign> = ({ name, value }) => ({ kind: "assign", name, value, meta: {} });
export const call: Builder<Nodes.Call> = ({ name, args }) => ({ kind: "call", name, args, meta: {} });
export const define: Builder<Nodes.Define> = ({ name, paramList, stmtList }) => ({ kind: "define", name, paramList, stmtList, meta: {} });
export const divide: Builder<Nodes.Divide> = ({ left, right }) => ({ kind: "divide", left, right, meta: {} });
export const exponentiate: Builder<Nodes.Exponentiate> = ({ left, right }) => ({ kind: "exponentiate", left, right, meta: {} });
export const modulo: Builder<Nodes.Modulo> = ({ left, right }) => ({ kind: "modulo", left, right, meta: {} });
export const multiply: Builder<Nodes.Multiply> = ({ left, right }) => ({ kind: "multiply", left, right, meta: {} });
export const negate: Builder<Nodes.Negate> = ({ value }) => ({ kind: "negate", value, meta: {} });
export const number: Builder<Nodes.Number & { source?: string }> = ({ value, source }) => ({ kind: "number", value, source, meta: {} });
export const param: Builder<Nodes.Param> = ({ name }) => ({ kind: "param", name, meta: {} });
export const paramList: Builder<Nodes.ParamList> = ({ params }) => ({ kind: "paramList" as const, params, meta: {} });
export const program: Builder<Nodes.Program> = ({ stmtList }) => ({ kind: "program", stmtList, meta: {} });
export const stmtList: Builder<Nodes.StmtList> = ({ stmts }) => ({ kind: "stmtList", stmts, meta: {} });
export const subtract: Builder<Nodes.Subtract> = ({ left, right }) => ({ kind: "subtract", left, right, meta: {} });
export const variable: Builder<Nodes.Variable> = ({ name }) => ({ kind: "variable", name, meta: {} });
