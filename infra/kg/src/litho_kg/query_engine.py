from typing import Any, Optional


class QueryEngine:
    def __init__(self, schema_manager):
        self.schema = schema_manager

    def find_recipe_for_pattern(self, pattern_embedding: list[float], threshold: float = 0.8) -> list[dict]:
        query = """
        CALL db.index.vector.queryNodes('layout_embedding', 5, $embedding)
        YIELD node, score
        WHERE score > $threshold
        MATCH (node)<-[:HAS_LAYOUT]-(r:OPCRecipe)
        RETURN r.id AS recipeId, r.algorithmVersion, r.iterations, score
        ORDER BY score DESC
        """
        return self.schema.execute(query, {"embedding": pattern_embedding, "threshold": threshold})

    def causal_inference(self, failing_pattern_id: str) -> dict:
        query = """
        MATCH path = (h:Hotspot {id: $patternId})-[*1..4]-(cause)
        WHERE cause:ProcessParameters OR cause:Mask OR cause:DefectRecord
        RETURN path, [n IN nodes(path) | n] AS causalChain
        LIMIT 10
        """
        return self.schema.execute(query, {"patternId": failing_pattern_id})

    def get_recipe_genealogy(self, recipe_id: str) -> list[dict]:
        query = """
        MATCH (r:OPCRecipe {id: $recipeId})-[:HAS_HISTORY]->(c:CorrectionHistory)
        RETURN c ORDER BY c.timestamp DESC
        """
        return self.schema.execute(query, {"recipeId": recipe_id})
