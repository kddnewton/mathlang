import { Insns } from "./types";
import stdlib, { isStdLibFunc } from "./stdlib";

function isOperation(object: Insns.All): object is Insns.Operation {
  return Object.prototype.hasOwnProperty.call(object, "type");
}

const machine = (insns: Insns.All[], locals: { [key: string]: number } = {}): number => {
  const funcs: { [key: string]: (...args: number[]) => number } = {};
  const stack: any[] = [];

  insns.forEach((insn) => {
    if (isOperation(insn)) {
      switch (insn.type) {
        case "call": {
          const name = stack.pop();
          const args = [];

          const length = stack.pop();
          for (let idx = 0; idx < length; idx += 1) {
            args.push(stack.pop());
          }

          const callback = isStdLibFunc(name) ? stdlib[name] : funcs[name];
          stack.push(callback(...args));
          break;
        }
        case "define": {
          const name = stack.pop();
          const params: string[] = [];

          const length = stack.pop();
          for (let idx = 0; idx < length; idx += 1) {
            params.push(stack.pop());
          }

          const childInsns = stack.pop();
          funcs[name] = (...args: number[]) => {
            const nextLocals: { [key: string]: number } = {};
            params.forEach((param, index) => {
              nextLocals[param] = args[index];
            });

            return machine(childInsns, nextLocals);
          };

          break;
        }
        case "getLocal":
          stack.push(locals[stack.pop()]);
          break;
        case "setLocal": {
          const name = stack.pop();
          locals[name] = stack.pop();
          break;
        }
        case "optAdd":
          stack.push(stack.pop() + stack.pop());
          break;
        case "optSub":
          stack.push(stack.pop() - stack.pop());
          break;
        case "optMul":
          stack.push(stack.pop() * stack.pop());
          break;
        case "optDiv":
          stack.push(stack.pop() / stack.pop());
          break;
        case "optExp":
          stack.push(Math.pow(stack.pop(), stack.pop()));
          break;
      }
    } else {
      stack.push(insn);
    }
  });

  return stack[stack.length - 1];
};

export default machine;
