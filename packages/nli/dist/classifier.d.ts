import type { Intent, NLIConfig } from "./types.js";
export declare class IntentClassifier {
    private config;
    constructor(config: NLIConfig);
    classify(text: string): Promise<Intent>;
    private computeConfidence;
}
//# sourceMappingURL=classifier.d.ts.map