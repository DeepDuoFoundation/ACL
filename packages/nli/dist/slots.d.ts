import type { Slot, NLIConfig } from "./types.js";
export declare class SlotExtractor {
    private config;
    constructor(config: NLIConfig);
    extract(text: string): Promise<Slot[]>;
}
//# sourceMappingURL=slots.d.ts.map