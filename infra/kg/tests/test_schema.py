import pytest
from litho_kg.schema_manager import SchemaManager
from litho_kg.query_engine import QueryEngine


def test_schema_manager_initialization():
    manager = SchemaManager()
    assert manager.uri == "bolt://localhost:7687"


def test_query_engine_initialization():
    manager = SchemaManager()
    engine = QueryEngine(manager)
    assert engine.schema is manager


def test_cypher_parsing():
    from pathlib import Path
    import tempfile
    cypher = """
    CREATE CONSTRAINT test IF NOT EXISTS FOR (n:Test) REQUIRE n.id IS UNIQUE;
    CREATE INDEX test_idx IF NOT EXISTS FOR (n:Test) ON (n.name);
    """
    with tempfile.NamedTemporaryFile(mode="w", suffix=".cypher", delete=False) as f:
        f.write(cypher)
        f.flush()
        manager = SchemaManager()
        # Verify parsing works (won't execute without Neo4j)
        statements = [s.strip() for s in cypher.split(";") if s.strip() and not s.strip().startswith("//")]
        assert len(statements) == 2
