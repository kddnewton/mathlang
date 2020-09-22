import { Insns } from "./types";
import stdlib, { isStdLib } from "./stdlib";

function isOperation(object: Insns.All): object is Insns.Operation {
  return Object.prototype.hasOwnProperty.call(object, "kind");
}

const virtualMachine = (insns: Insns.All[], locals: { [key: string]: number } = {}): number => {
  const funcs: { [key: string]: (...args: number[]) => number } = {};
  const stack: any[] = [];

  insns.forEach((insn) => {
    if (isOperation(insn)) {
      switch (insn.kind) {
        case "add":
          stack.push(stack.pop() + stack.pop());
          break;
        case "call": {
          const name = stack.pop();
          const args = [];

          const length = stack.pop();
          for (let idx = 0; idx < length; idx += 1) {
            args.push(stack.pop());
          }

          const callback = isStdLib(name) ? stdlib[name] : funcs[name];
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

            return virtualMachine(childInsns, nextLocals);
          };

          break;
        }
        case "divide":
          stack.push(stack.pop() / stack.pop());
          break;
        case "exponentiate":
          stack.push(Math.pow(stack.pop(), stack.pop()));
          break;
        case "getLocal":
          stack.push(locals[stack.pop()]);
          break;
        case "modulo":
          stack.push(stack.pop() % stack.pop());
          break;
        case "multiply":
          stack.push(stack.pop() * stack.pop());
          break;
        case "negate":
          stack.push(stack.pop() * -1);
          break;
        case "setLocal":
          locals[stack.pop()] = stack.pop();
          break;
        case "subtract":
          stack.push(stack.pop() - stack.pop());
          break;
      }
    } else {
      stack.push(insn);
    }
  });

  return stack[stack.length - 1];
};

export default virtualMachine;
