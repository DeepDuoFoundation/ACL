/**
 * Closed-Loop Fab Feedback — PRD §6.5 (Fab Integration)
 * Real-time metrology feedback for Digital Twin recalibration, drift detection
 */

export interface MetrologyData {
  waferId: string;
  layer: string;
  measurements: Array<{ parameter: string; value: number; target: number; unit: string }>;
  timestamp: string;
  scannerId: string;
}

export interface DriftAlert {
  id: string;
  scannerId: string;
  parameter: string;
  currentValue: number;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  recommendation: string;
  timestamp: string;
}

export class FabFeedbackLoop {
  private driftHistory: Map<string, DriftAlert[]> = new Map();
  private readonly DRIFT_THRESHOLDS = {
    focus: { warning: 3, critical: 7 },
    dose: { warning: 2, critical: 5 },
    overlay: { warning: 1.5, critical: 3 },
  };

  async ingestMetrology(data: MetrologyData): Promise<DriftAlert[]> {
    const alerts: DriftAlert[] = [];
    for (const m of data.measurements) {
      const deviation = Math.abs(m.value - m.target);
      const thresholds = (this.DRIFT_THRESHOLDS as any)[m.parameter];
      if (thresholds && deviation > thresholds.critical) {
        alerts.push(this.createAlert(data.scannerId, m.parameter, m.value, deviation, 'critical'));
      } else if (thresholds && deviation > thresholds.warning) {
        alerts.push(this.createAlert(data.scannerId, m.parameter, m.value, deviation, 'warning'));
      }
    }
    if (alerts.length > 0) {
      this.driftHistory.set(data.scannerId, [...(this.driftHistory.get(data.scannerId) || []), ...alerts]);
    }
    return alerts;
  }

  async recalibrateDigitalTwin(scannerId: string, metrologyData: MetrologyData[]): Promise<{ adjustments: Record<string, number>; confidence: number }> {
    const adjustments: Record<string, number> = {};
    let totalDeviation = 0;
    let count = 0;

    for (const data of metrologyData) {
      for (const m of data.measurements) {
        const delta = m.value - m.target;
        adjustments[m.parameter] = (adjustments[m.parameter] || 0) + delta;
        totalDeviation += Math.abs(delta);
        count++;
      }
    }

    for (const key of Object.keys(adjustments)) {
      adjustments[key] /= metrologyData.length;
    }

    return {
      adjustments,
      confidence: Math.max(0, 1 - (totalDeviation / (count * 10))),
    };
  }

  getActiveAlerts(): DriftAlert[] {
    const all: DriftAlert[] = [];
    for (const alerts of this.driftHistory.values()) {
      all.push(...alerts);
    }
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);
  }

  private createAlert(scannerId: string, parameter: string, value: number, deviation: number, severity: 'warning' | 'critical'): DriftAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      scannerId,
      parameter,
      currentValue: value,
      threshold: deviation,
      severity: severity as any,
      recommendation: severity === 'critical' ? `Immediate recalibration required for ${parameter} on ${scannerId}` : `Monitor ${parameter} drift on ${scannerId}`,
      timestamp: new Date().toISOString(),
    };
  }
}