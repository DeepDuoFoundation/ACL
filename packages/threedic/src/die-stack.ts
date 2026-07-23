import type { DieLayer, DieStack } from "./types.js";

export class DieStackModel {
  private stacks = new Map<string, DieStack>();

  createStack(id: string, name: string, dies: DieLayer[], bondingType: DieStack["bondingType"]): DieStack {
    const stack: DieStack = { id, name, dies, bondingType };
    this.stacks.set(id, stack);
    return stack;
  }

  getStack(id: string): DieStack | undefined {
    return this.stacks.get(id);
  }

  addDie(stackId: string, die: DieLayer, position?: number): void {
    const stack = this.stacks.get(stackId);
    if (!stack) throw new Error(`Stack not found: ${stackId}`);
    if (position !== undefined) {
      stack.dies.splice(position, 0, die);
    } else {
      stack.dies.push(die);
    }
  }

  removeDie(stackId: string, dieId: string): boolean {
    const stack = this.stacks.get(stackId);
    if (!stack) return false;
    const idx = stack.dies.findIndex((d) => d.id === dieId);
    if (idx === -1) return false;
    stack.dies.splice(idx, 1);
    return true;
  }

  getTotalHeight(stackId: string): number {
    const stack = this.stacks.get(stackId);
    if (!stack) return 0;
    return stack.dies.reduce((sum, d) => sum + d.thickness, 0);
  }

  getTotalPower(stackId: string): number {
    const stack = this.stacks.get(stackId);
    if (!stack) return 0;
    return stack.dies.reduce((sum, d) => sum + d.tdp, 0);
  }

  getDieCount(stackId: string): number {
    return this.stacks.get(stackId)?.dies.length ?? 0;
  }
}