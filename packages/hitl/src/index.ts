/**
 * Human-in-the-Loop (HITL) Framework — PRD §6.2
 * 4-mode governance: Auto-Accept, Review-Before-Release, Mandatory Approval, Override
 */

export type HitlMode = 'auto_accept' | 'review_before_release' | 'mandatory_approval' | 'override';

export interface HitlDecision {
  id: string;
  agentId: string;
  agentName: string;
  recommendation: string;
  confidence: number;
  mode: HitlMode;
  evidence: string[];
  kgNodes: string[];
  digitalTwinResults: string[];
  status: 'pending' | 'approved' | 'rejected' | 'overridden';
  reviewedBy?: string;
  reviewedAt?: string;
  overrideAction?: string;
  timestamp: string;
}

export interface HitlAuditLog {
  decisions: HitlDecision[];
  totalReviewed: number;
  totalAutoAccepted: number;
  totalOverridden: number;
  averageResponseTime: number;
}

export class HitlFramework {
  private decisions: HitlDecision[] = [];
  private pendingApprovals: HitlDecision[] = [];

  async evaluate(agentId: string, agentName: string, recommendation: string, confidence: number, evidence: string[]): Promise<HitlDecision> {
    // Determine mode based on confidence and risk
    const mode = this.determineMode(confidence, evidence);
    
    const decision: HitlDecision = {
      id: `hitl_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      agentId,
      agentName,
      recommendation,
      confidence,
      mode,
      evidence,
      kgNodes: evidence.filter(e => e.startsWith('KG:')).map(e => e.replace('KG:', '')),
      digitalTwinResults: evidence.filter(e => e.startsWith('DT:')),
      status: mode === 'auto_accept' ? 'approved' : 'pending',
      timestamp: new Date().toISOString(),
    };

    this.decisions.push(decision);
    
    if (decision.status === 'pending') {
      this.pendingApprovals.push(decision);
    }

    return decision;
  }

  async approve(decisionId: string, reviewer: string): Promise<HitlDecision> {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) throw new Error(`Decision ${decisionId} not found`);
    
    decision.status = 'approved';
    decision.reviewedBy = reviewer;
    decision.reviewedAt = new Date().toISOString();
    
    this.pendingApprovals = this.pendingApprovals.filter(d => d.id !== decisionId);
    return decision;
  }

  async reject(decisionId: string, reviewer: string): Promise<HitlDecision> {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) throw new Error(`Decision ${decisionId} not found`);
    
    decision.status = 'rejected';
    decision.reviewedBy = reviewer;
    decision.reviewedAt = new Date().toISOString();
    
    this.pendingApprovals = this.pendingApprovals.filter(d => d.id !== decisionId);
    return decision;
  }

  async override(decisionId: string, reviewer: string, overrideAction: string): Promise<HitlDecision> {
    const decision = this.decisions.find(d => d.id === decisionId);
    if (!decision) throw new Error(`Decision ${decisionId} not found`);
    
    decision.status = 'overridden';
    decision.reviewedBy = reviewer;
    decision.reviewedAt = new Date().toISOString();
    decision.overrideAction = overrideAction;
    decision.mode = 'override';
    
    this.pendingApprovals = this.pendingApprovals.filter(d => d.id !== decisionId);
    return decision;
  }

  getPendingApprovals(): HitlDecision[] {
    return this.pendingApprovals;
  }

  getAuditLog(): HitlAuditLog {
    return {
      decisions: this.decisions,
      totalReviewed: this.decisions.filter(d => d.status !== 'pending').length,
      totalAutoAccepted: this.decisions.filter(d => d.mode === 'auto_accept').length,
      totalOverridden: this.decisions.filter(d => d.status === 'overridden').length,
      averageResponseTime: this.computeAverageResponseTime(),
    };
  }

  private determineMode(confidence: number, evidence: string[]): HitlMode {
    if (confidence >= 0.95 && evidence.length >= 2) return 'auto_accept';
    if (confidence >= 0.80 && evidence.length >= 1) return 'review_before_release';
    if (confidence < 0.80 || evidence.length === 0) return 'mandatory_approval';
    return 'review_before_release';
  }

  private computeAverageResponseTime(): number {
    const reviewed = this.decisions.filter(d => d.reviewedAt && d.timestamp);
    if (reviewed.length === 0) return 0;
    const totalTime = reviewed.reduce((sum, d) => {
      return sum + (new Date(d.reviewedAt!).getTime() - new Date(d.timestamp).getTime());
    }, 0);
    return totalTime / reviewed.length / 60000; // minutes
  }
}