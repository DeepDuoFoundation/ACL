export class RecipeLibrary {
    kg;
    recipes = new Map();
    constructor(kg) {
        this.kg = kg;
    }
    async addRecipe(recipe) {
        this.recipes.set(recipe.id, recipe);
        const node = {
            id: recipe.id,
            type: "recipe",
            properties: {
                name: recipe.name,
                pdk: recipe.pdk,
                layer: recipe.layer,
                parameters: recipe.parameters,
                successRate: recipe.successRate,
                usageCount: recipe.usageCount,
            },
            confidence: recipe.confidence,
            createdAt: recipe.createdAt,
            updatedAt: Date.now(),
        };
        this.kg.addNode(node);
    }
    async getRecipe(id) {
        return this.recipes.get(id);
    }
    async findRecipes(pdk, layer) {
        return Array.from(this.recipes.values()).filter((r) => r.pdk === pdk && r.layer === layer);
    }
    async getTopRecipes(pdk, layer, count) {
        const recipes = await this.findRecipes(pdk, layer);
        return recipes
            .sort((a, b) => b.successRate * b.confidence - a.successRate * a.confidence)
            .slice(0, count);
    }
    async updateSuccessRate(id, success) {
        const recipe = this.recipes.get(id);
        if (recipe) {
            const total = recipe.usageCount + 1;
            const successes = recipe.successRate * recipe.usageCount + (success ? 1 : 0);
            recipe.successRate = successes / total;
            recipe.usageCount = total;
            recipe.confidence = Math.min(1, recipe.confidence + (success ? 0.01 : -0.02));
        }
    }
    async promoteRecipe(id) {
        const recipe = this.recipes.get(id);
        if (recipe) {
            recipe.confidence = Math.min(1, recipe.confidence + 0.1);
        }
    }
    async demoteRecipe(id) {
        const recipe = this.recipes.get(id);
        if (recipe) {
            recipe.confidence = Math.max(0, recipe.confidence - 0.1);
        }
    }
    getStats() {
        const byPDK = {};
        let totalSuccessRate = 0;
        for (const recipe of this.recipes.values()) {
            byPDK[recipe.pdk] = (byPDK[recipe.pdk] ?? 0) + 1;
            totalSuccessRate += recipe.successRate;
        }
        return {
            totalRecipes: this.recipes.size,
            byPDK,
            avgSuccessRate: this.recipes.size > 0 ? totalSuccessRate / this.recipes.size : 0,
        };
    }
}
//# sourceMappingURL=recipes.js.map