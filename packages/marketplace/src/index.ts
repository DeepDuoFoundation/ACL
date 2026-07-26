/**
 * Plugin Marketplace — PRD §6.9 (Phase 3)
 * Community-contributed, sandboxed agent modules registered via @litho/capability
 */

export interface MarketplacePlugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  type: 'skill' | 'agent' | 'connector' | 'mcp' | 'pdk';
  downloads: number;
  rating: number;
  verified: boolean;
  source: string;
  manifest: Record<string, any>;
  publishedAt: string;
}

export class Marketplace {
  private plugins: Map<string, MarketplacePlugin> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.plugins.set('custom-resist-model', {
      id: 'custom-resist-model', name: 'Custom Resist Agent', description: 'Advanced resist profile simulation for EUV and High-NA processes',
      author: 'DDF AI Core', version: '1.0.0', type: 'agent', downloads: 1240, rating: 4.5, verified: true,
      source: '@litho/capability', manifest: { hooks: ['init', 'run', 'report'] }, publishedAt: '2026-03-15',
    });
    this.plugins.set('tsmc-n2-pdk', {
      id: 'tsmc-n2-pdk', name: 'TSMC N2 PDK Connector', description: 'Process Design Kit for TSMC N2 node with GAA nanosheet support',
      author: 'TSMC Alliance', version: '2.1.0', type: 'pdk', downloads: 890, rating: 4.8, verified: true,
      source: '@litho/pdk', manifest: { node: 'N2', foundry: 'tsmc' }, publishedAt: '2026-06-01',
    });
    this.plugins.set('curvilinear-mask-toolkit', {
      id: 'curvilinear-mask-toolkit', name: 'Curvilinear Mask Toolkit', description: 'Advanced curvilinear mask synthesis for High-NA EUV lithography',
      author: 'MaskTech Inc.', version: '1.2.0', type: 'skill', downloads: 670, rating: 4.2, verified: false,
      source: 'community', manifest: { algorithms: ['inverse', 'level-set'] }, publishedAt: '2026-04-20',
    });
  }

  async search(query: string): Promise<MarketplacePlugin[]> {
    const q = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)
    );
  }

  async getPlugin(id: string): Promise<MarketplacePlugin | undefined> {
    return this.plugins.get(id);
  }

  async listByType(type: string): Promise<MarketplacePlugin[]> {
    return Array.from(this.plugins.values()).filter(p => p.type === type);
  }

  async install(id: string): Promise<{ success: boolean; plugin: MarketplacePlugin }> {
    const plugin = this.plugins.get(id);
    if (!plugin) throw new Error(`Plugin ${id} not found`);
    return { success: true, plugin };
  }

  async publish(plugin: MarketplacePlugin): Promise<void> {
    this.plugins.set(plugin.id, plugin);
  }
}