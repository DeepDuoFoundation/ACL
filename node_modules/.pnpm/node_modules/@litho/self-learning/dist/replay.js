export class ExperienceReplay {
    buffer = [];
    maxSize;
    constructor(maxSize) {
        this.maxSize = maxSize;
    }
    add(experience) {
        this.buffer.push(experience);
        if (this.buffer.length > this.maxSize) {
            this.buffer.shift();
        }
    }
    sample(batchSize) {
        const sampled = [];
        const indices = new Set();
        while (indices.size < Math.min(batchSize, this.buffer.length)) {
            const idx = Math.floor(Math.random() * this.buffer.length);
            if (!indices.has(idx)) {
                indices.add(idx);
                sampled.push(this.buffer[idx]);
            }
        }
        return sampled;
    }
    getRecent(count) {
        return this.buffer.slice(-count);
    }
    getHighReward(count) {
        return [...this.buffer]
            .sort((a, b) => b.reward - a.reward)
            .slice(0, count);
    }
    size() {
        return this.buffer.length;
    }
    clear() {
        this.buffer = [];
    }
}
//# sourceMappingURL=replay.js.map