// 002_indexes.cypher
// Full-text search indexes
CREATE FULLTEXT INDEX layout_search IF NOT EXISTS FOR (l:Layout) ON EACH [l.designFamily, l.node, l.sourceHash];
CREATE FULLTEXT INDEX recipe_search IF NOT EXISTS FOR (r:OPCRecipe) ON EACH [r.algorithmVersion, r.description];

// Property indexes for common queries
CREATE INDEX mask_yield IF NOT EXISTS FOR (m:Mask) ON (m.yieldOutcome);
CREATE INDEX defect_severity IF NOT EXISTS FOR (d:DefectRecord) ON (d.severity);
CREATE INDEX correction_timestamp IF NOT EXISTS FOR (c:CorrectionHistory) ON (c.timestamp);
