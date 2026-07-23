interface Experience {
  id: string;
  data: Record<string, unknown>;
  reward: number;
  timestamp: number;
}

export class ExperienceReplay {
  private buffer: Experience[] = [];
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  add(experience: Experience): void {
    this.buffer.push(experience);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  sample(batchSize: number): Experience[] {
    const sampled: Experience[] = [];
    const indices = new Set<number>();

    while (indices.size < Math.min(batchSize, this.buffer.length)) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        sampled.push(this.buffer[idx]);
      }
    }

    return sampled;
  }

  getRecent(count: number): Experience[] {
    return this.buffer.slice(-count);
  }

  getHighReward(count: number): Experience[] {
    return [...this.buffer]
      .sort((a, b) => b.reward - a.reward)
      .slice(0, count);
  }

  size(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}
