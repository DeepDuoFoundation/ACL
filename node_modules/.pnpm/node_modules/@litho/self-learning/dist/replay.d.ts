interface Experience {
    id: string;
    data: Record<string, unknown>;
    reward: number;
    timestamp: number;
}
export declare class ExperienceReplay {
    private buffer;
    private maxSize;
    constructor(maxSize: number);
    add(experience: Experience): void;
    sample(batchSize: number): Experience[];
    getRecent(count: number): Experience[];
    getHighReward(count: number): Experience[];
    size(): number;
    clear(): void;
}
export {};
//# sourceMappingURL=replay.d.ts.map