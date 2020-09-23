import { Nodes } from "./types";

type Builder<T> = (opts: Omit<T, "kind" | "type">) => T;

export const add: Builder<Nodes.Add> = ({ left, right }) => ({ kind: "add", left, right, type: {} });
export const assign: Builder<Nodes.Assign> = ({ name, value }) => ({ kind: "assign", name, value, type: {} });
export const call: Builder<Nodes.Call> = ({ name, args }) => ({ kind: "call", name, args, type: {} });
export const define: Builder<Nodes.Define> = ({ name, paramList, stmtList }) => ({ kind: "define", name, paramList, stmtList, type: {} });
export const divide: Builder<Nodes.Divide> = ({ left, right }) => ({ kind: "divide", left, right, type: {} });
export const exponentiate: Builder<Nodes.Exponentiate> = ({ left, right }) => ({ kind: "exponentiate", left, right, type: {} });
export const modulo: Builder<Nodes.Modulo> = ({ left, right }) => ({ kind: "modulo", left, right, type: {} });
export const multiply: Builder<Nodes.Multiply> = ({ left, right }) => ({ kind: "multiply", left, right, type: {} });
export const negate: Builder<Nodes.Negate> = ({ value }) => ({ kind: "negate", value, type: {} });
export const number: Builder<Nodes.Number & { source?: string }> = ({ value, source }) => ({ kind: "number", value, source, type: {} });
export const param: Builder<Nodes.Param> = ({ name }) => ({ kind: "param", name, type: {} });
export const paramList: Builder<Nodes.ParamList> = ({ params }) => ({ kind: "paramList" as const, params, type: {} });
export const program: Builder<Nodes.Program> = ({ stmtList }) => ({ kind: "program", stmtList, type: {} });
export const stmtList: Builder<Nodes.StmtList> = ({ stmts }) => ({ kind: "stmtList", stmts, type: {} });
export const subtract: Builder<Nodes.Subtract> = ({ left, right }) => ({ kind: "subtract", left, right, type: {} });
export const variable: Builder<Nodes.Variable> = ({ name }) => ({ kind: "variable", name, type: {} });
