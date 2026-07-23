export class DieStackModel {
    stacks = new Map();
    createStack(id, name, dies, bondingType) {
        const stack = { id, name, dies, bondingType };
        this.stacks.set(id, stack);
        return stack;
    }
    getStack(id) {
        return this.stacks.get(id);
    }
    addDie(stackId, die, position) {
        const stack = this.stacks.get(stackId);
        if (!stack)
            throw new Error(`Stack not found: ${stackId}`);
        if (position !== undefined) {
            stack.dies.splice(position, 0, die);
        }
        else {
            stack.dies.push(die);
        }
    }
    removeDie(stackId, dieId) {
        const stack = this.stacks.get(stackId);
        if (!stack)
            return false;
        const idx = stack.dies.findIndex((d) => d.id === dieId);
        if (idx === -1)
            return false;
        stack.dies.splice(idx, 1);
        return true;
    }
    getTotalHeight(stackId) {
        const stack = this.stacks.get(stackId);
        if (!stack)
            return 0;
        return stack.dies.reduce((sum, d) => sum + d.thickness, 0);
    }
    getTotalPower(stackId) {
        const stack = this.stacks.get(stackId);
        if (!stack)
            return 0;
        return stack.dies.reduce((sum, d) => sum + d.tdp, 0);
    }
    getDieCount(stackId) {
        return this.stacks.get(stackId)?.dies.length ?? 0;
    }
}
