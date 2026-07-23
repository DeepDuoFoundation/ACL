// 001_initial_schema.cypher
// Layout nodes
CREATE CONSTRAINT layout_id IF NOT EXISTS FOR (l:Layout) REQUIRE l.id IS UNIQUE;

// Mask nodes
CREATE CONSTRAINT mask_id IF NOT EXISTS FOR (m:Mask) REQUIRE m.id IS UNIQUE;

// OPC Recipe nodes
CREATE CONSTRAINT opc_recipe_id IF NOT EXISTS FOR (r:OPCRecipe) REQUIRE r.id IS UNIQUE;

// Process Parameters nodes
CREATE CONSTRAINT process_params_id IF NOT EXISTS FOR (p:ProcessParameters) REQUIRE p.id IS UNIQUE;

// Defect Record nodes
CREATE CONSTRAINT defect_record_id IF NOT EXISTS FOR (d:DefectRecord) REQUIRE d.id IS UNIQUE;

// Yield Record nodes
CREATE CONSTRAINT yield_record_id IF NOT EXISTS FOR (y:YieldRecord) REQUIRE y.id IS UNIQUE;

// Hotspot nodes
CREATE CONSTRAINT hotspot_id IF NOT EXISTS FOR (h:Hotspot) REQUIRE h.id IS UNIQUE;

// Correction History nodes
CREATE CONSTRAINT correction_history_id IF NOT EXISTS FOR (c:CorrectionHistory) REQUIRE c.id IS UNIQUE;
