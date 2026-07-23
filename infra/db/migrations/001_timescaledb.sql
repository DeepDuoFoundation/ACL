-- 001_timescaledb.sql
-- Digital Twin time-series state store

-- Equipment state tracking
CREATE TABLE IF NOT EXISTS equipment_state (
    time        TIMESTAMPTZ NOT NULL,
    equipment_id TEXT NOT NULL,
    metric      TEXT NOT NULL,
    value       DOUBLE PRECISION NOT NULL,
    metadata    JSONB DEFAULT '{}'
);

SELECT create_hypertable('equipment_state', 'time');

-- Add compression policy
ALTER TABLE equipment_state SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'equipment_id, metric',
    timescaledb.compress_orderby = 'time DESC'
);

SELECT add_compression_policy('equipment_state', INTERVAL '7 days');

-- Simulation results
CREATE TABLE IF NOT EXISTS simulation_results (
    time            TIMESTAMPTZ NOT NULL,
    job_id          TEXT NOT NULL,
    simulation_type TEXT NOT NULL,
    params          JSONB NOT NULL,
    results         JSONB NOT NULL,
    runtime_ms      INTEGER
);

SELECT create_hypertable('simulation_results', 'time');

-- Equipment drift alerts
CREATE TABLE IF NOT EXISTS drift_alerts (
    time            TIMESTAMPTZ NOT NULL,
    equipment_id    TEXT NOT NULL,
    metric          TEXT NOT NULL,
    drift_value     DOUBLE PRECISION NOT NULL,
    threshold       DOUBLE PRECISION NOT NULL,
    acknowledged    BOOLEAN DEFAULT FALSE
);

SELECT create_hypertable('drift_alerts', 'time');

-- Continuous aggregate: hourly equipment utilisation
CREATE MATERIALIZED VIEW IF NOT EXISTS equipment_utilisation_hourly
WITH (timescaledb.continutive) AS
SELECT
    time_bucket('1 hour', time) AS bucket,
    equipment_id,
    AVG(value) AS avg_value,
    MAX(value) AS max_value,
    MIN(value) AS min_value
FROM equipment_state
WHERE metric = 'utilisation'
GROUP BY bucket, equipment_id;

-- Retention policy: keep raw data for 90 days
SELECT add_retention_policy('equipment_state', INTERVAL '90 days');
SELECT add_retention_policy('simulation_results', INTERVAL '90 days');
