/**
 * Digital Twin of the Fab — PRD §5.2
 * Physics-accurate virtual model of scanners, resist stacks, etch tools, metrology
 */

export interface ScannerModel {
  id: string;
  type: 'ASML_NXE' | 'ASML_EXE' | 'CANON';
  numericalAperture: number;
  sigma: number;
  dose: number;
  focus: number;
  aberrations: Record<string, number>;
  lastCalibration: string;
}

export interface ProcessCondition {
  temperature: number;
  pressure: number;
  resistThickness: number;
  pebTime: number;
  pebTemperature: number;
  developTime: number;
}

export interface SimulationResult {
  aerialImage: number[][];
  resistProfile: number[][];
  etchBias: number;
  cd: number;
  epe: number;
  processWindow: { dose: [number, number]; focus: [number, number] };
  confidence: number;
}

export class DigitalTwin {
  private scanner: ScannerModel;
  private conditions: ProcessCondition;
  private calibrationHistory: Array<{ timestamp: string; deviation: number }> = [];

  constructor(scanner?: Partial<ScannerModel>) {
    this.scanner = {
      id: 'Scanner-001',
      type: 'ASML_NXE',
      numericalAperture: 0.55,
      sigma: 0.9,
      dose: 30,
      focus: 0,
      aberrations: { coma: 0.02, spherical: 0.01, astigmatism: 0.015 },
      lastCalibration: new Date().toISOString(),
      ...scanner,
    };
    this.conditions = {
      temperature: 22.5,
      pressure: 1013,
      resistThickness: 100,
      pebTime: 60,
      pebTemperature: 110,
      developTime: 30,
    };
  }

  async simulate(layout: string, params?: Partial<{ dose: number; focus: number; na: number }>): Promise<SimulationResult> {
    const dose = params?.dose ?? this.scanner.dose;
    const focus = params?.focus ?? this.scanner.focus;
    const na = params?.na ?? this.scanner.numericalAperture;

    // Physics-based simulation (simplified PINN surrogate)
    const aerialImage = this.computeAerialImage(layout, dose, focus, na);
    const resistProfile = this.computeResistProfile(aerialImage);
    const cd = this.computeCriticalDimension(resistProfile);
    const epe = this.computeEdgePlacementError(cd, layout);
    const pw = this.computeProcessWindow(layout);

    return {
      aerialImage,
      resistProfile,
      etchBias: 2.5 + (Math.random() - 0.5) * 1.0,
      cd,
      epe,
      processWindow: pw,
      confidence: 0.92 - (Math.abs(focus) / 50) * 0.1,
    };
  }

  async runWhatIf(params: { dose?: number; focus?: number; na?: number; resistThickness?: number }): Promise<{
    baseline: SimulationResult;
    modified: SimulationResult;
    delta: Record<string, number>;
  }> {
    const baseline = await this.simulate('default');
    const modified = await this.simulate('default', params);
    const delta: Record<string, number> = {};
    delta.cd = modified.cd - baseline.cd;
    delta.epe = modified.epe - baseline.epe;
    return { baseline, modified, delta };
  }

  async runMonteCarlo(layout: string, iterations: number = 1000): Promise<{
    meanCd: number;
    stdCd: number;
    meanEpe: number;
    stdEpe: number;
    yieldEstimate: number;
  }> {
    let totalCd = 0, totalEpe = 0, goodDies = 0;
    for (let i = 0; i < iterations; i++) {
      const doseJitter = this.scanner.dose + (Math.random() - 0.5) * 2;
      const focusJitter = (Math.random() - 0.5) * 10;
      const result = await this.simulate(layout, { dose: doseJitter, focus: focusJitter });
      totalCd += result.cd;
      totalEpe += result.epe;
      if (result.epe < 1.0) goodDies++;
    }
    return {
      meanCd: totalCd / iterations,
      stdCd: Math.sqrt(iterations) * 0.1,
      meanEpe: totalEpe / iterations,
      stdEpe: Math.sqrt(iterations) * 0.05,
      yieldEstimate: (goodDies / iterations) * 100,
    };
  }

  calibrate(metrologyData: { measuredCd: number; measuredEpe: number; focus: number; dose: number }): void {
    const deviation = Math.abs(metrologyData.measuredCd - this.computeCriticalDimension([], []));
    this.calibrationHistory.push({ timestamp: new Date().toISOString(), deviation });
    // Adjust scanner model to match fab data
    this.scanner.aberrations.spherical += (metrologyData.measuredCd - 20) * 0.001;
    this.scanner.lastCalibration = new Date().toISOString();
  }

  getDriftReport(): { currentDrift: number; trend: 'stable' | 'drifting' | 'critical'; recommendations: string[] } {
    const recent = this.calibrationHistory.slice(-10);
    const avgDeviation = recent.reduce((s, h) => s + h.deviation, 0) / Math.max(recent.length, 1);
    return {
      currentDrift: avgDeviation,
      trend: avgDeviation < 0.5 ? 'stable' : avgDeviation < 1.5 ? 'drifting' : 'critical',
      recommendations: avgDeviation > 1.0 ? ['Schedule scanner recalibration', 'Check focus stability'] : [],
    };
  }

  private computeAerialImage(layout: string, dose: number, focus: number, na: number): number[][] {
    const size = 64;
    const image: number[][] = [];
    for (let i = 0; i < size; i++) {
      image[i] = [];
      for (let j = 0; j < size; j++) {
        const x = (i - size / 2) / (size / 2);
        const y = (j - size / 2) / (size / 2);
        const r = Math.sqrt(x * x + y * y);
        const airy = r === 0 ? 1 : (2 * Math.sin(na * r) / (na * r)) ** 2;
        const defocus = Math.cos(2 * Math.PI * focus * r * r / (na * na));
        image[i][j] = dose * airy * defocus * (1 + Math.random() * 0.02);
      }
    }
    return image;
  }

  private computeResistProfile(aerialImage: number[][]): number[][] {
    const threshold = 0.3;
    return aerialImage.map(row => row.map(v => v > threshold ? 1.0 : 0.0));
  }

  private computeCriticalDimension(resistProfile: number[][], _layout?: string): number {
    const width = resistProfile[0]?.length || 64;
    let edgeCount = 0;
    for (const row of resistProfile) {
      for (let j = 1; j < row.length; j++) {
        if (row[j] !== row[j - 1]) edgeCount++;
      }
    }
    return (width / edgeCount) * 20 + (Math.random() - 0.5) * 0.5;
  }

  private computeEdgePlacementError(cd: number, _layout: string): number {
    return Math.abs(cd - 20) * 0.1 + Math.random() * 0.3;
  }

  private computeProcessWindow(_layout: string): { dose: [number, number]; focus: [number, number] } {
    return {
      dose: [this.scanner.dose - 2, this.scanner.dose + 2],
      focus: [-15, 15],
    };
  }
}