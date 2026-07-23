const SLOT_PATTERNS = {
    layer: [/layer\s+(\w+)/i, /for\s+(\w+)\s+layer/i],
    pitch: [/pitch\s+(\d+)/i, /(\d+)\s*nm\s+pitch/i],
    iterations: [/(\d+)\s+iterations?/i, /max\s+(\d+)/i],
    threshold: [/threshold\s+([\d.]+)/i, /(\d+)\s+nm\s+threshold/i],
    mode: [/mode\s+(\w+)/i, /in\s+(\w+)\s+mode/i],
};
export class SlotExtractor {
    config;
    constructor(config) {
        this.config = config;
    }
    async extract(text) {
        const slots = [];
        for (const [slotName, patterns] of Object.entries(SLOT_PATTERNS)) {
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    const value = match[1];
                    const numericValue = Number(value);
                    slots.push({
                        name: slotName,
                        value: isNaN(numericValue) ? value : numericValue,
                        confidence: 0.85,
                    });
                    break;
                }
            }
        }
        return slots.slice(0, this.config.maxSlots);
    }
}
//# sourceMappingURL=slots.js.map