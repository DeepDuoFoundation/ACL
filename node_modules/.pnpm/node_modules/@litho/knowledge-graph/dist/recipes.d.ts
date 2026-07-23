import type { Recipe } from "./types.js";
import { KnowledgeGraph } from "./graph.js";
export declare class RecipeLibrary {
    private kg;
    private recipes;
    constructor(kg: KnowledgeGraph);
    addRecipe(recipe: Recipe): Promise<void>;
    getRecipe(id: string): Promise<Recipe | undefined>;
    findRecipes(pdk: string, layer: string): Promise<Recipe[]>;
    getTopRecipes(pdk: string, layer: string, count: number): Promise<Recipe[]>;
    updateSuccessRate(id: string, success: boolean): Promise<void>;
    promoteRecipe(id: string): Promise<void>;
    demoteRecipe(id: string): Promise<void>;
    getStats(): {
        totalRecipes: number;
        byPDK: Record<string, number>;
        avgSuccessRate: number;
    };
}
//# sourceMappingURL=recipes.d.ts.map