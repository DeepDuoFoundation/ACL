import type { DieLayer, DieStack } from "./types.js";
export declare class DieStackModel {
    private stacks;
    createStack(id: string, name: string, dies: DieLayer[], bondingType: DieStack["bondingType"]): DieStack;
    getStack(id: string): DieStack | undefined;
    addDie(stackId: string, die: DieLayer, position?: number): void;
    removeDie(stackId: string, dieId: string): boolean;
    getTotalHeight(stackId: string): number;
    getTotalPower(stackId: string): number;
    getDieCount(stackId: string): number;
}
