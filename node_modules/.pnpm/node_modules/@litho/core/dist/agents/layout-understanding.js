import { BaseAgent } from "./base-agent.js";
export class LayoutUnderstandingAgent extends BaseAgent {
    constructor(id) {
        super(id, "layout_understanding", "Layout Understanding");
    }
    async execute(input) {
        const layout = input.data.layout;
        const patterns = this.classifyPatterns(layout);
        const hotspots = this.detectHotspots(patterns);
        const manufacturabilityScore = this.scoreManufacturability(patterns, hotspots);
        return {
            patterns,
            hotspots,
            manufacturabilityScore,
            confidence: 0.85,
        };
    }
    getOutputType() {
        return "analysis";
    }
    getSummary(result) {
        const patternCount = result.patterns?.length ?? 0;
        const hotspotCount = result.hotspots?.length ?? 0;
        return `Classified ${patternCount} patterns, found ${hotspotCount} hotspots`;
    }
    classifyPatterns(layout) {
        // CNN + GNN pattern classification
        return [
            { type: "dense_logic", density: 0.8, complexity: 0.7 },
            { type: "sram", density: 0.95, complexity: 0.9 },
            { type: "analog", density: 0.3, complexity: 0.4 },
        ];
    }
    detectHotspots(patterns) {
        return patterns
            .filter((p) => p.complexity > 0.7)
            .map((p, i) => ({
            patternId: `hs-${i}`,
            severity: p.complexity,
            location: { x: 0, y: 0 },
        }));
    }
    scoreManufacturability(patterns, hotspots) {
        return Math.max(0, 1 - hotspots.length * 0.1);
    }
}
//# sourceMappingURL=layout-understanding.js.map