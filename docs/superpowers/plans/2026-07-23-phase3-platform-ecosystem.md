# Phase 3 — Platform & Ecosystem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 3 of LithoMind AI by delivering NLI v3, three new foundry PDKs (Intel 18A, GF 22FDX, UMC), Plugin Marketplace, 3DIC multi-die support, closed-loop fab feedback, and white-label report engine.

**Architecture:** Extends existing packages. PDK configs follow the established `PDKConfig` interface pattern. NLI v3 builds on `nli-v2` with conversation memory and multi-turn clarification. New packages (`@litho/marketplace`, `@litho/threedic`, `@litho/fab-feedback`) follow the same structure as existing packages. White-label reports extend `@litho/reporting`.

**Tech Stack:** TypeScript (ESM), Vitest, pnpm workspaces, `@litho/*` packages.

---

## File Map

### New Files
| File | Package | Purpose |
|------|---------|---------|
| `packages/pdk/src/intel-18a.ts` | `@litho/pdk` | Intel 18A Ribbon-FET PDK config |
| `packages/pdk/src/gf-22fdx.ts` | `@litho/pdk` | GlobalFoundries 22FDX FDSOI PDK config |
| `packages/pdk/src/umc-22nm.ts` | `@litho/pdk` | UMC 22nm PDK config |
| `packages/nli-v3/src/engine.ts` | `@litho/nli-v3` | Conversational NLI with multi-turn memory |
| `packages/nli-v3/src/conversation.ts` | `@litho/nli-v3` | Conversation state manager with slot persistence |
| `packages/nli-v3/src/clarification.ts` | `@litho/nli-v3` | Clarification question generator |
| `packages/nli-v3/src/types.ts` | `@litho/nli-v3` | NLI v3 type definitions |
| `packages/nli-v3/src/index.ts` | `@litho/nli-v3` | Package exports |
| `packages/nli-v3/tests/nli-v3.test.ts` | `@litho/nli-v3` | 12 tests for NLI v3 |
| `packages/marketplace/src/registry.ts` | `@litho/marketplace` | Plugin marketplace registry |
| `packages/marketplace/src/sandbox.ts` | `@litho/marketplace` | Plugin sandboxing interface |
| `packages/marketplace/src/signing.ts` | `@litho/marketplace` | Code signing verification |
| `packages/marketplace/src/types.ts` | `@litho/marketplace` | Marketplace type definitions |
| `packages/marketplace/src/index.ts` | `@litho/marketplace` | Package exports |
| `packages/marketplace/tests/marketplace.test.ts` | `@litho/marketplace` | 8 tests for marketplace |
| `packages/threedic/src/die-stack.ts` | `@litho/threedic` | Multi-die stack model |
| `packages/threedic/src/thermal.ts` | `@litho/threedic` | Thermal simulation for 3DIC |
| `packages/threedic/src/correction.ts` | `@litho/threedic` | Multi-die correction agent |
| `packages/threedic/src/types.ts` | `@litho/threedic` | 3DIC type definitions |
| `packages/threedic/src/index.ts` | `@litho/threedic` | Package exports |
| `packages/threedic/tests/threedic.test.ts` | `@litho/threedic` | 9 tests for 3DIC |
| `packages/fab-feedback/src/collector.ts` | `@litho/fab-feedback` | Metrology data collector |
| `packages/fab-feedback/src/calibrator.ts` | `@litho/fab-feedback` | Digital Twin recalibration engine |
| `packages/fab-feedback/src/drift-alert.ts` | `@litho/fab-feedback` | Real-time drift alerting |
| `packages/fab-feedback/src/types.ts` | `@litho/fab-feedback` | Fab feedback type definitions |
| `packages/fab-feedback/src/index.ts` | `@litho/fab-feedback` | Package exports |
| `packages/fab-feedback/tests/fab-feedback.test.ts` | `@litho/fab-feedback` | 10 tests for fab feedback |
| `packages/reporting/src/whitelabel.ts` | `@litho/reporting` | White-label report renderer |
| `packages/reporting/tests/whitelabel.test.ts` | `@litho/reporting` | 5 tests for white-label |

### Modified Files
| File | Change |
|------|--------|
| `packages/pdk/src/manager.ts` | Register Intel 18A, GF 22FDX, UMC PDKs |
| `packages/pdk/tests/pdk.test.ts` | Add tests for 3 new PDKs |

---

## Task 1: Intel 18A PDK

**Files:**
- Create: `packages/pdk/src/intel-18a.ts`
- Modify: `packages/pdk/src/manager.ts:11`
- Modify: `packages/pdk/tests/pdk.test.ts`

- [ ] **Step 1: Write Intel 18A PDK config**

```typescript
// packages/pdk/src/intel-18a.ts
import type { PDKConfig } from "./types.js";

export const Intel18A: PDKConfig = {
  name: "intel-18a",
  node: "18A",
  vendor: "Intel Foundry",
  version: "1.0.0",
  layers: [
    { name: "Gate", type: "poly", minWidth: 18, minPitch: 48, minSpacing: 16, opacity: 1.0 },
    { name: "Metal1", type: "metal", minWidth: 21, minPitch: 42, minSpacing: 18, opacity: 0.8 },
    { name: "Metal2", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 20, opacity: 0.8 },
    { name: "Metal3", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.8 },
    { name: "Via1", type: "via", minWidth: 20, minPitch: 42, minSpacing: 18, opacity: 0.6 },
  ],
  opcRules: [
    { layer: "Gate", type: "model_based", aggressiveness: 0.9, maxIterations: 15, convergenceThreshold: 0.5 },
    { layer: "Metal1", type: "model_based", aggressiveness: 0.8, maxIterations: 12, convergenceThreshold: 0.8 },
    { layer: "Metal2", type: "rule_based", aggressiveness: 0.7, maxIterations: 10, convergenceThreshold: 1.0 },
  ],
  designRules: [
    { name: "minGateLength", description: "Minimum gate length", min: 18, layer: "Gate" },
    { name: "minMetalWidth", description: "Minimum metal width", min: 21, layer: "Metal1" },
    { name: "minMetalPitch", description: "Minimum metal pitch", min: 42, layer: "Metal1" },
    { name: "minSpacing", description: "Minimum spacing", min: 16, layer: "Gate" },
    { name: "minViaSize", description: "Minimum via size", min: 20, layer: "Via1" },
  ],
  illumination: { wavelength: 13.5, na: 0.55, sigma: 0.85, polarization: "quadrupole" },
  resist: { type: "EUV_positive", thickness: 30, sensitivity: 40 },
};
```

- [ ] **Step 2: Register Intel 18A in PDK manager**

```typescript
// packages/pdk/src/manager.ts — add import and registration
import { Intel18A } from "./intel-18a.js";

// In constructor, add:
this.registerPDK(Intel18A);
```

- [ ] **Step 3: Add Intel 18A test**

```typescript
// packages/pdk/tests/pdk.test.ts — add test case
it("should load Intel 18A PDK", () => {
  const manager = new PDKManager();
  const config = manager.loadPDK("intel-18a");
  expect(config.node).toBe("18A");
  expect(config.vendor).toBe("Intel Foundry");
  expect(config.illumination.na).toBe(0.55);
  expect(config.layers.length).toBeGreaterThanOrEqual(4);
  expect(manager.listAvailable()).toContain("intel-18a");
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @litho/pdk test`

- [ ] **Step 5: Commit**

```bash
git add packages/pdk/src/intel-18a.ts packages/pdk/src/manager.ts packages/pdk/tests/pdk.test.ts
git commit -m "feat(pdk): add Intel 18A Ribbon-FET PDK config"
```

---

## Task 2: GlobalFoundries 22FDX PDK

**Files:**
- Create: `packages/pdk/src/gf-22fdx.ts`
- Modify: `packages/pdk/src/manager.ts`
- Modify: `packages/pdk/tests/pdk.test.ts`

- [ ] **Step 1: Write GF 22FDX PDK config**

```typescript
// packages/pdk/src/gf-22fdx.ts
import type { PDKConfig } from "./types.js";

export const GF22FDX: PDKConfig = {
  name: "gf-22fdx",
  node: "22FDX",
  vendor: "GlobalFoundries",
  version: "1.0.0",
  layers: [
    { name: "Gate", type: "poly", minWidth: 22, minPitch: 60, minSpacing: 20, opacity: 1.0 },
    { name: "Metal1", type: "metal", minWidth: 24, minPitch: 48, minSpacing: 20, opacity: 0.8 },
    { name: "Metal2", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.8 },
    { name: "Metal3", type: "metal", minWidth: 32, minPitch: 64, minSpacing: 28, opacity: 0.8 },
    { name: "Via1", type: "via", minWidth: 22, minPitch: 48, minSpacing: 20, opacity: 0.6 },
  ],
  opcRules: [
    { layer: "Gate", type: "model_based", aggressiveness: 0.85, maxIterations: 12, convergenceThreshold: 0.6 },
    { layer: "Metal1", type: "model_based", aggressiveness: 0.75, maxIterations: 10, convergenceThreshold: 0.8 },
    { layer: "Metal2", type: "rule_based", aggressiveness: 0.7, maxIterations: 8, convergenceThreshold: 1.0 },
  ],
  designRules: [
    { name: "minGateLength", description: "Minimum gate length", min: 22, layer: "Gate" },
    { name: "minMetalWidth", description: "Minimum metal width", min: 24, layer: "Metal1" },
    { name: "minMetalPitch", description: "Minimum metal pitch", min: 48, layer: "Metal1" },
    { name: "minSpacing", description: "Minimum spacing", min: 20, layer: "Gate" },
    { name: "minViaSize", description: "Minimum via size", min: 22, layer: "Via1" },
    { name: "fdsoi_backgate", description: "FDSOI back-gate bias range", min: -2000, max: 2000 },
  ],
  illumination: { wavelength: 193, na: 1.2, sigma: 0.9, polarization: "dipole" },
  resist: { type: "ArF_positive", thickness: 100, sensitivity: 35 },
};
```

- [ ] **Step 2: Register GF 22FDX in PDK manager**

```typescript
// packages/pdk/src/manager.ts — add import and registration
import { GF22FDX } from "./gf-22fdx.js";

// In constructor, add:
this.registerPDK(GF22FDX);
```

- [ ] **Step 3: Add GF 22FDX test**

```typescript
// packages/pdk/tests/pdk.test.ts — add test case
it("should load GF 22FDX PDK", () => {
  const manager = new PDKManager();
  const config = manager.loadPDK("gf-22fdx");
  expect(config.node).toBe("22FDX");
  expect(config.vendor).toBe("GlobalFoundries");
  expect(config.illumination.wavelength).toBe(193);
  expect(config.resist.type).toBe("ArF_positive");
  expect(manager.listAvailable()).toContain("gf-22fdx");
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @litho/pdk test`

- [ ] **Step 5: Commit**

```bash
git add packages/pdk/src/gf-22fdx.ts packages/pdk/src/manager.ts packages/pdk/tests/pdk.test.ts
git commit -m "feat(pdk): add GlobalFoundries 22FDX FDSOI PDK config"
```

---

## Task 3: UMC 22nm PDK

**Files:**
- Create: `packages/pdk/src/umc-22nm.ts`
- Modify: `packages/pdk/src/manager.ts`
- Modify: `packages/pdk/tests/pdk.test.ts`

- [ ] **Step 1: Write UMC 22nm PDK config**

```typescript
// packages/pdk/src/umc-22nm.ts
import type { PDKConfig } from "./types.js";

export const UMC22nm: PDKConfig = {
  name: "umc-22nm",
  node: "22nm",
  vendor: "UMC",
  version: "1.0.0",
  layers: [
    { name: "Gate", type: "poly", minWidth: 22, minPitch: 64, minSpacing: 22, opacity: 1.0 },
    { name: "Metal1", type: "metal", minWidth: 28, minPitch: 56, minSpacing: 24, opacity: 0.8 },
    { name: "Metal2", type: "metal", minWidth: 32, minPitch: 64, minSpacing: 28, opacity: 0.8 },
    { name: "Metal3", type: "metal", minWidth: 40, minPitch: 80, minSpacing: 32, opacity: 0.8 },
    { name: "Via1", type: "via", minWidth: 26, minPitch: 56, minSpacing: 24, opacity: 0.6 },
  ],
  opcRules: [
    { layer: "Gate", type: "model_based", aggressiveness: 0.8, maxIterations: 10, convergenceThreshold: 0.8 },
    { layer: "Metal1", type: "rule_based", aggressiveness: 0.7, maxIterations: 8, convergenceThreshold: 1.0 },
    { layer: "Metal2", type: "rule_based", aggressiveness: 0.65, maxIterations: 8, convergenceThreshold: 1.2 },
  ],
  designRules: [
    { name: "minGateLength", description: "Minimum gate length", min: 22, layer: "Gate" },
    { name: "minMetalWidth", description: "Minimum metal width", min: 28, layer: "Metal1" },
    { name: "minMetalPitch", description: "Minimum metal pitch", min: 56, layer: "Metal1" },
    { name: "minSpacing", description: "Minimum spacing", min: 22, layer: "Gate" },
    { name: "minViaSize", description: "Minimum via size", min: 26, layer: "Via1" },
  ],
  illumination: { wavelength: 193, na: 1.2, sigma: 0.85, polarization: "C-quad" },
  resist: { type: "ArF_positive", thickness: 120, sensitivity: 38 },
};
```

- [ ] **Step 2: Register UMC 22nm in PDK manager**

```typescript
// packages/pdk/src/manager.ts — add import and registration
import { UMC22nm } from "./umc-22nm.js";

// In constructor, add:
this.registerPDK(UMC22nm);
```

- [ ] **Step 3: Add UMC 22nm test**

```typescript
// packages/pdk/tests/pdk.test.ts — add test case
it("should load UMC 22nm PDK", () => {
  const manager = new PDKManager();
  const config = manager.loadPDK("umc-22nm");
  expect(config.node).toBe("22nm");
  expect(config.vendor).toBe("UMC");
  expect(config.illumination.wavelength).toBe(193);
  expect(manager.listAvailable()).toContain("umc-22nm");
});

it("should have all 5 PDKs registered", () => {
  const manager = new PDKManager();
  expect(manager.listAvailable()).toHaveLength(5);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @litho/pdk test`

- [ ] **Step 5: Commit**

```bash
git add packages/pdk/src/umc-22nm.ts packages/pdk/src/manager.ts packages/pdk/tests/pdk.test.ts
git commit -m "feat(pdk): add UMC 22nm PDK config — 5 foundries now supported"
```

---

## Task 4: NLI v3 Types & Package Scaffold

**Files:**
- Create: `packages/nli-v3/package.json`
- Create: `packages/nli-v3/tsconfig.json`
- Create: `packages/nli-v3/src/types.ts`
- Create: `packages/nli-v3/src/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@litho/nli-v3",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@litho/nli-v2": "workspace:*"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "vitest": "2.1.9"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write NLI v3 types**

```typescript
// packages/nli-v3/src/types.ts
export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  intent?: string;
  slots?: Record<string, unknown>;
}

export interface ConversationSession {
  id: string;
  userId: string;
  turns: ConversationTurn[];
  accumulatedSlots: Record<string, unknown>;
  currentIntent: string | null;
  createdAt: number;
  lastActiveAt: number;
}

export interface ClarificationQuestion {
  question: string;
  slotName: string;
  options?: string[];
  required: boolean;
}

export interface NLIv3Config {
  maxTurns: number;
  sessionTimeoutMs: number;
  clarificationThreshold: number;
  supportedIntents: string[];
}

export interface NLIv3Response {
  message: string;
  intent: string;
  confidence: number;
  slots: Record<string, unknown>;
  needsClarification: boolean;
  clarificationQuestions: ClarificationQuestion[];
  sessionId: string;
}
```

- [ ] **Step 4: Create index.ts with exports**

```typescript
// packages/nli-v3/src/index.ts
export type { ConversationTurn, ConversationSession, ClarificationQuestion, NLIv3Config, NLIv3Response } from "./types.js";
```

- [ ] **Step 5: Run build to verify types compile**

Run: `pnpm --filter @litho/nli-v3 build`

- [ ] **Step 6: Commit**

```bash
git add packages/nli-v3/
git commit -m "feat(nli-v3): scaffold package with types for conversational NLI"
```

---

## Task 5: NLI v3 Conversation Manager

**Files:**
- Create: `packages/nli-v3/src/conversation.ts`

- [ ] **Step 1: Write conversation manager**

```typescript
// packages/nli-v3/src/conversation.ts
import type { ConversationSession, ConversationTurn } from "./types.js";

export class ConversationManager {
  private sessions = new Map<string, ConversationSession>();

  createSession(sessionId: string, userId: string): ConversationSession {
    const session: ConversationSession = {
      id: sessionId,
      userId,
      turns: [],
      accumulatedSlots: {},
      currentIntent: null,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): ConversationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getOrCreateSession(sessionId: string, userId: string): ConversationSession {
    return this.sessions.get(sessionId) ?? this.createSession(sessionId, userId);
  }

  addTurn(sessionId: string, turn: ConversationTurn): void {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    session.turns.push(turn);
    session.lastActiveAt = Date.now();
    if (turn.slots) {
      Object.assign(session.accumulatedSlots, turn.slots);
    }
    if (turn.intent) {
      session.currentIntent = turn.intent;
    }
  }

  mergeSlots(sessionId: string, newSlots: Record<string, unknown>): Record<string, unknown> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    Object.assign(session.accumulatedSlots, newSlots);
    return { ...session.accumulatedSlots };
  }

  getSlot(sessionId: string, slotName: string): unknown | undefined {
    const session = this.sessions.get(sessionId);
    return session?.accumulatedSlots[slotName];
  }

  isExpired(sessionId: string, timeoutMs: number): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return true;
    return Date.now() - session.lastActiveAt > timeoutMs;
  }

  getRecentTurns(sessionId: string, count: number): ConversationTurn[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];
    return session.turns.slice(-count);
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}
```

- [ ] **Step 2: Update index.ts exports**

Add to `packages/nli-v3/src/index.ts`:
```typescript
export { ConversationManager } from "./conversation.js";
```

- [ ] **Step 3: Commit**

```bash
git add packages/nli-v3/src/conversation.ts packages/nli-v3/src/index.ts
git commit -m "feat(nli-v3): add conversation manager with slot accumulation"
```

---

## Task 6: NLI v3 Clarification Engine

**Files:**
- Create: `packages/nli-v3/src/clarification.ts`

- [ ] **Step 1: Write clarification engine**

```typescript
// packages/nli-v3/src/clarification.ts
import type { ClarificationQuestion, ConversationSession } from "./types.js";

const REQUIRED_SLOTS: Record<string, string[]> = {
  run_opc: ["layer"],
  optimize_mask: ["layer"],
  set_pdk: ["pdk_name"],
  simulate: ["layer"],
  rca_investigate: ["layer"],
  twin_simulate: ["parameter"],
  show_pareto: [],
};

const SLOT_QUESTIONS: Record<string, string> = {
  layer: "Which layer should I work on?",
  pdk_name: "Which PDK should I load?",
  parameter: "What parameter should I vary in the simulation?",
  dose: "What dose adjustment should I apply?",
  focus: "What focus offset should I apply?",
  iterations: "How many iterations should I run?",
};

export class ClarificationEngine {
  private threshold: number;

  constructor(threshold: number = 0.7) {
    this.threshold = threshold;
  }

  getRequiredSlots(intent: string): string[] {
    return REQUIRED_SLOTS[intent] ?? [];
  }

  findMissingSlots(intent: string, currentSlots: Record<string, unknown>): string[] {
    const required = this.getRequiredSlots(intent);
    return required.filter((slot) => currentSlots[slot] === undefined || currentSlots[slot] === null || currentSlots[slot] === "");
  }

  generateQuestions(intent: string, currentSlots: Record<string, unknown>): ClarificationQuestion[] {
    const missing = this.findMissingSlots(intent, currentSlots);
    return missing.map((slot) => ({
      question: SLOT_QUESTIONS[slot] ?? `Please provide a value for "${slot}".`,
      slotName: slot,
      required: true,
    }));
  }

  needsClarification(confidence: number, missingSlots: string[]): boolean {
    return confidence < this.threshold || missingSlots.length > 0;
  }

  extractSlotFromResponse(question: ClarificationQuestion, response: string): { slotName: string; value: string } | null {
    if (!response || response.trim().length === 0) return null;
    return { slotName: question.slotName, value: response.trim() };
  }
}
```

- [ ] **Step 2: Update index.ts exports**

Add to `packages/nli-v3/src/index.ts`:
```typescript
export { ClarificationEngine } from "./clarification.js";
```

- [ ] **Step 3: Commit**

```bash
git add packages/nli-v3/src/clarification.ts packages/nli-v3/src/index.ts
git commit -m "feat(nli-v3): add clarification engine with slot-based questions"
```

---

## Task 7: NLI v3 Engine

**Files:**
- Create: `packages/nli-v3/src/engine.ts`

- [ ] **Step 1: Write NLI v3 engine**

```typescript
// packages/nli-v3/src/engine.ts
import type { NLIv3Config, NLIv3Response, ConversationSession } from "./types.js";
import { ConversationManager } from "./conversation.js";
import { ClarificationEngine } from "./clarification.js";

const DEFAULT_CONFIG: NLIv3Config = {
  maxTurns: 50,
  sessionTimeoutMs: 30 * 60 * 1000,
  clarificationThreshold: 0.7,
  supportedIntents: [],
};

const INTENT_PATTERNS: Record<string, string[]> = {
  run_opc: ["run opc", "correct mask", "opc correction"],
  analyze_layout: ["analyze layout", "check design", "review gds"],
  simulate: ["simulate", "run simulation", "aerial image"],
  check_drc: ["drc check", "design rule", "check rules"],
  optimize_mask: ["optimize mask", "ilt", "inverse litho"],
  get_report: ["get report", "show results", "generate report"],
  set_pdk: ["set pdk", "load pdk", "use pdk"],
  configure_gpu: ["gpu config", "setup gpu", "allocate gpu"],
  rca_investigate: ["rca", "root cause", "investigate failure"],
  show_pareto: ["show pareto", "multi-objective", "trade-off"],
  twin_simulate: ["what if", "twin simulate", "digital twin"],
  compare_runs: ["compare", "diff runs", "comparison"],
};

export class NLIV3Engine {
  private config: NLIv3Config;
  private conversationManager: ConversationManager;
  private clarificationEngine: ClarificationEngine;

  constructor(config: Partial<NLIv3Config> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.conversationManager = new ConversationManager();
    this.clarificationEngine = new ClarificationEngine(this.config.clarificationThreshold);
  }

  async processMessage(sessionId: string, userId: string, message: string): Promise<NLIv3Response> {
    const session = this.conversationManager.getOrCreateSession(sessionId, userId);

    this.conversationManager.addTurn(sessionId, {
      role: "user",
      content: message,
      timestamp: Date.now(),
    });

    const intent = this.classifyIntent(message);
    const newSlots = this.extractSlots(message);
    const mergedSlots = this.conversationManager.mergeSlots(sessionId, newSlots);

    const missingSlots = this.clarificationEngine.findMissingSlots(intent.name, mergedSlots);
    const needsClarification = this.clarificationEngine.needsClarification(intent.confidence, missingSlots);

    if (needsClarification && missingSlots.length > 0) {
      const questions = this.clarificationEngine.generateQuestions(intent.name, mergedSlots);
      const response: NLIv3Response = {
        message: `I understand you want to ${intent.name.replace(/_/g, " ")}. Let me clarify a few things.`,
        intent: intent.name,
        confidence: intent.confidence,
        slots: mergedSlots,
        needsClarification: true,
        clarificationQuestions: questions,
        sessionId,
      };
      this.conversationManager.addTurn(sessionId, {
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
        intent: intent.name,
        slots: mergedSlots,
      });
      return response;
    }

    const responseMessage = this.generateResponse(intent.name, mergedSlots, session);
    const response: NLIv3Response = {
      message: responseMessage,
      intent: intent.name,
      confidence: intent.confidence,
      slots: mergedSlots,
      needsClarification: false,
      clarificationQuestions: [],
      sessionId,
    };

    this.conversationManager.addTurn(sessionId, {
      role: "assistant",
      content: responseMessage,
      timestamp: Date.now(),
      intent: intent.name,
      slots: mergedSlots,
    });

    return response;
  }

  async processClarification(sessionId: string, slotName: string, value: string): Promise<NLIv3Response> {
    const session = this.conversationManager.getSession(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);

    this.conversationManager.mergeSlots(sessionId, { [slotName]: value });
    const slots = session.accumulatedSlots;
    const intent = session.currentIntent ?? "unknown";

    const missingSlots = this.clarificationEngine.findMissingSlots(intent, slots);
    if (missingSlots.length > 0) {
      const questions = this.clarificationEngine.generateQuestions(intent, slots);
      return {
        message: `Got it. One more thing:`,
        intent,
        confidence: 1.0,
        slots,
        needsClarification: true,
        clarificationQuestions: questions,
        sessionId,
      };
    }

    const responseMessage = this.generateResponse(intent, slots, session);
    return {
      message: responseMessage,
      intent,
      confidence: 1.0,
      slots,
      needsClarification: false,
      clarificationQuestions: [],
      sessionId,
    };
  }

  private classifyIntent(message: string): { name: string; confidence: number } {
    const normalized = message.toLowerCase().trim();
    let bestIntent = "unknown";
    let bestConfidence = 0;

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      if (this.config.supportedIntents.length > 0 && !this.config.supportedIntents.includes(intent)) continue;
      for (const pattern of patterns) {
        if (normalized.includes(pattern)) {
          const confidence = this.computeConfidence(normalized, pattern);
          if (confidence > bestConfidence) {
            bestConfidence = confidence;
            bestIntent = intent;
          }
        }
      }
    }

    return { name: bestIntent, confidence: bestConfidence };
  }

  private computeConfidence(text: string, pattern: string): number {
    const textWords = text.split(/\s+/);
    const patternWords = pattern.split(/\s+/);
    const matches = patternWords.filter((w) => textWords.includes(w)).length;
    return matches / patternWords.length;
  }

  private extractSlots(text: string): Record<string, string> {
    const slots: Record<string, string> = {};
    const layerMatch = text.match(/(?:for|layer)\s+(\w+)/i);
    if (layerMatch) slots.layer = layerMatch[1];
    const pdkMatch = text.match(/(?:pdk|node)\s+(\S+)/i);
    if (pdkMatch) slots.pdk_name = pdkMatch[1];
    const paramMatch = text.match(/(?:increase|decrease|set)\s+(\w+)\s+(?:to|by)\s+(\S+)/i);
    if (paramMatch) { slots.parameter = paramMatch[1]; slots.value = paramMatch[2]; }
    return slots;
  }

  private generateResponse(intent: string, slots: Record<string, unknown>, session: ConversationSession): string {
    const layer = slots.layer ? ` on ${slots.layer}` : "";
    const pdk = slots.pdk_name ? ` using ${slots.pdk_name}` : "";
    const turnCount = session.turns.filter((t) => t.role === "user").length;
    const contextHint = turnCount > 1 ? " (building on our conversation)" : "";

    switch (intent) {
      case "run_opc": return `Launching OPC correction${layer}${pdk}${contextHint}. Job queued.`;
      case "analyze_layout": return `Analyzing layout${layer}${contextHint}. Starting analysis.`;
      case "simulate": return `Running simulation${layer}${contextHint}. GPU allocated.`;
      case "check_drc": return `Running DRC check${layer}${contextHint}. Results pending.`;
      case "optimize_mask": return `Starting ILT optimization${layer}${contextHint}. This may take time.`;
      case "get_report": return `Generating report${contextHint}. Ready for download.`;
      case "set_pdk`: return `Loading PDK${pdk}${contextHint}. Configuration applied.`;
      case "rca_investigate": return `Starting RCA investigation${layer}${contextHint}. Analyzing causal graph.`;
      case "show_pareto": return `Displaying Pareto front${contextHint}. Trade-off analysis ready.`;
      case "twin_simulate": return `Running Digital Twin simulation${contextHint}. Virtual experiment started.`;
      case "compare_runs": return `Comparing runs${contextHint}. Side-by-side analysis ready.`;
      default: return `I understand your request${contextHint}. Processing...`;
    }
  }

  getConversationManager(): ConversationManager {
    return this.conversationManager;
  }
}
```

- [ ] **Step 2: Update index.ts exports**

Update `packages/nli-v3/src/index.ts`:
```typescript
export type { ConversationTurn, ConversationSession, ClarificationQuestion, NLIv3Config, NLIv3Response } from "./types.js";
export { ConversationManager } from "./conversation.js";
export { ClarificationEngine } from "./clarification.js";
export { NLIV3Engine } from "./engine.js";
```

- [ ] **Step 3: Commit**

```bash
git add packages/nli-v3/src/engine.ts packages/nli-v3/src/index.ts
git commit -m "feat(nli-v3): add conversational engine with multi-turn memory and clarification"
```

---

## Task 8: NLI v3 Tests

**Files:**
- Create: `packages/nli-v3/tests/nli-v3.test.ts`

- [ ] **Step 1: Write comprehensive tests**

```typescript
// packages/nli-v3/tests/nli-v3.test.ts
import { describe, it, expect } from "vitest";
import { NLIV3Engine } from "../src/engine.js";
import { ConversationManager } from "../src/conversation.js";
import { ClarificationEngine } from "../src/clarification.js";

describe("NLIV3Engine", () => {
  it("should process a simple OPC command", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Run opc for Metal1");
    expect(response.intent).toBe("run_opc");
    expect(response.slots.layer).toBe("Metal1");
    expect(response.needsClarification).toBe(false);
    expect(response.message).toContain("OPC correction");
  });

  it("should request clarification when layer is missing", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Run opc");
    expect(response.needsClarification).toBe(true);
    expect(response.clarificationQuestions.length).toBeGreaterThan(0);
    expect(response.clarificationQuestions[0].slotName).toBe("layer");
  });

  it("should accumulate slots across turns", async () => {
    const engine = new NLIV3Engine();
    await engine.processMessage("s1", "user1", "Run opc");
    const response = await engine.processClarification("s1", "layer", "Metal1");
    expect(response.needsClarification).toBe(false);
    expect(response.slots.layer).toBe("Metal1");
  });

  it("should maintain conversation context across multiple turns", async () => {
    const engine = new NLIV3Engine();
    await engine.processMessage("s1", "user1", "Run opc for Metal1");
    const response = await engine.processMessage("s1", "user1", "What about Metal2?");
    expect(response.slots.layer).toBe("Metal2");
    expect(response.message).toContain("building on our conversation");
  });

  it("should classify twin_simulate intent", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "What if I increase dose by 3%?");
    expect(response.intent).toBe("twin_simulate");
    expect(response.slots.parameter).toBe("dose");
  });

  it("should classify RCA intent", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Investigate the failure on Gate layer");
    expect(response.intent).toBe("rca_investigate");
    expect(response.slots.layer).toBe("Gate");
  });

  it("should classify compare_runs intent", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Compare these two runs");
    expect(response.intent).toBe("compare_runs");
  });

  it("should handle set_pdk intent with clarification", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("s1", "user1", "Load pdk");
    expect(response.needsClarification).toBe(true);
    expect(response.clarificationQuestions[0].slotName).toBe("pdk_name");
  });

  it("should return session ID in response", async () => {
    const engine = new NLIV3Engine();
    const response = await engine.processMessage("test-session", "user1", "Analyze layout for Metal1");
    expect(response.sessionId).toBe("test-session");
  });
});

describe("ConversationManager", () => {
  it("should create and retrieve sessions", () => {
    const mgr = new ConversationManager();
    const session = mgr.createSession("s1", "user1");
    expect(session.id).toBe("s1");
    expect(mgr.getSession("s1")).toBeDefined();
  });

  it("should merge slots across turns", () => {
    const mgr = new ConversationManager();
    mgr.createSession("s1", "user1");
    mgr.mergeSlots("s1", { layer: "Metal1" });
    mgr.mergeSlots("s1", { pdk_name: "tsmc-n3e" });
    expect(mgr.getSlot("s1", "layer")).toBe("Metal1");
    expect(mgr.getSlot("s1", "pdk_name")).toBe("tsmc-n3e");
  });

  it("should detect expired sessions", () => {
    const mgr = new ConversationManager();
    mgr.createSession("s1", "user1");
    expect(mgr.isExpired("s1", 1000)).toBe(false);
    expect(mgr.isExpired("nonexistent", 1000)).toBe(true);
  });
});

describe("ClarificationEngine", () => {
  it("should find missing required slots", () => {
    const engine = new ClarificationEngine();
    const missing = engine.findMissingSlots("run_opc", {});
    expect(missing).toContain("layer");
  });

  it("should not report missing slots when all are present", () => {
    const engine = new ClarificationEngine();
    const missing = engine.findMissingSlots("run_opc", { layer: "Metal1" });
    expect(missing).toHaveLength(0);
  });

  it("should generate clarification questions", () => {
    const engine = new ClarificationEngine();
    const questions = engine.generateQuestions("run_opc", {});
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].required).toBe(true);
  });

  it("should determine when clarification is needed", () => {
    const engine = new ClarificationEngine();
    expect(engine.needsClarification(0.5, [])).toBe(true);
    expect(engine.needsClarification(0.9, [])).toBe(false);
    expect(engine.needsClarification(0.9, ["layer"])).toBe(true);
  });
});
```

- [ ] **Step 2: Install dependencies and run tests**

Run: `cd packages/nli-v3 && pnpm install && pnpm test`

- [ ] **Step 3: Commit**

```bash
git add packages/nli-v3/tests/nli-v3.test.ts
git commit -m "test(nli-v3): add 15 tests for conversational NLI engine"
```

---

## Task 9: Plugin Marketplace Package

**Files:**
- Create: `packages/marketplace/package.json`
- Create: `packages/marketplace/tsconfig.json`
- Create: `packages/marketplace/src/types.ts`
- Create: `packages/marketplace/src/registry.ts`
- Create: `packages/marketplace/src/sandbox.ts`
- Create: `packages/marketplace/src/signing.ts`
- Create: `packages/marketplace/src/index.ts`
- Create: `packages/marketplace/tests/marketplace.test.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@litho/marketplace",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {
    "@litho/capability": "workspace:*"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "vitest": "2.1.9"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write marketplace types**

```typescript
// packages/marketplace/src/types.ts
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: "agent" | "simulator" | "connector" | "visualization";
  certified: boolean;
  signature?: string;
  publishedAt: number;
  updatedAt: number;
}

export interface PluginVersion {
  version: string;
  tarballHash: string;
  signature: string;
  publishedAt: number;
  minPlatformVersion: string;
}

export interface SandboxConfig {
  enabled: boolean;
  networkAccess: boolean;
  filesystemAccess: "none" | "read-only" | "read-write";
  maxMemoryMb: number;
  maxCpuTimeMs: number;
}

export interface AuditEntry {
  pluginId: string;
  action: "install" | "update" | "remove" | "execute";
  timestamp: number;
  userId: string;
  result: "success" | "failure";
  details?: string;
}
```

- [ ] **Step 4: Write registry**

```typescript
// packages/marketplace/src/registry.ts
import type { PluginMetadata, PluginVersion } from "./types.js";

export class PluginRegistry {
  private plugins = new Map<string, PluginMetadata>();
  private versions = new Map<string, PluginVersion[]>();

  registerPlugin(meta: PluginMetadata): void {
    this.plugins.set(meta.id, meta);
    if (!this.versions.has(meta.id)) {
      this.versions.set(meta.id, []);
    }
  }

  getPlugin(id: string): PluginMetadata | undefined {
    return this.plugins.get(id);
  }

  listPlugins(category?: string): PluginMetadata[] {
    const all = Array.from(this.plugins.values());
    if (category) return all.filter((p) => p.category === category);
    return all;
  }

  addVersion(pluginId: string, version: PluginVersion): void {
    const versions = this.versions.get(pluginId);
    if (!versions) throw new Error(`Plugin not found: ${pluginId}`);
    versions.push(version);
  }

  getVersions(pluginId: string): PluginVersion[] {
    return this.versions.get(pluginId) ?? [];
  }

  getLatestVersion(pluginId: string): PluginVersion | undefined {
    const versions = this.getVersions(pluginId);
    return versions[versions.length - 1];
  }

  search(query: string): PluginMetadata[] {
    const lower = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(
      (p) => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower)
    );
  }

  removePlugin(id: string): boolean {
    this.versions.delete(id);
    return this.plugins.delete(id);
  }
}
```

- [ ] **Step 5: Write sandbox**

```typescript
// packages/marketplace/src/sandbox.ts
import type { SandboxConfig, PluginMetadata } from "./types.js";

const DEFAULT_SANDBOX: SandboxConfig = {
  enabled: true,
  networkAccess: false,
  filesystemAccess: "read-only",
  maxMemoryMb: 512,
  maxCpuTimeMs: 30000,
};

export class PluginSandbox {
  private configs = new Map<string, SandboxConfig>();

  configure(pluginId: string, config: Partial<SandboxConfig>): void {
    this.configs.set(pluginId, { ...DEFAULT_SANDBOX, ...config });
  }

  getConfig(pluginId: string): SandboxConfig {
    return this.configs.get(pluginId) ?? DEFAULT_SANDBOX;
  }

  canAccessNetwork(pluginId: string): boolean {
    return this.getConfig(pluginId).networkAccess;
  }

  canAccessFilesystem(pluginId: string, mode: "read" | "write"): boolean {
    const access = this.getConfig(pluginId).filesystemAccess;
    if (access === "none") return false;
    if (mode === "write" && access === "read-only") return false;
    return true;
  }

  checkMemoryLimit(pluginId: string, currentMb: number): boolean {
    return currentMb <= this.getConfig(pluginId).maxMemoryMb;
  }

  checkCpuTimeLimit(pluginId: string, elapsedMs: number): boolean {
    return elapsedMs <= this.getConfig(pluginId).maxCpuTimeMs;
  }

  validatePlugin(meta: PluginMetadata, config?: Partial<SandboxConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!meta.id) errors.push("Plugin ID is required");
    if (!meta.name) errors.push("Plugin name is required");
    if (!meta.version) errors.push("Plugin version is required");
    if (!meta.author) errors.push("Plugin author is required");
    const sandboxConfig = config ? { ...DEFAULT_SANDBOX, ...config } : DEFAULT_SANDBOX;
    if (sandboxConfig.maxMemoryMb < 64) errors.push("Memory limit must be at least 64MB");
    return { valid: errors.length === 0, errors };
  }
}
```

- [ ] **Step 6: Write signing**

```typescript
// packages/marketplace/src/signing.ts
import type { PluginMetadata, PluginVersion } from "./types.js";

export class SigningVerifier {
  verifyPlugin(meta: PluginMetadata): { valid: boolean; reason?: string } {
    if (!meta.certified) {
      return { valid: false, reason: "Plugin is not certified" };
    }
    if (!meta.signature) {
      return { valid: false, reason: "Missing signature" };
    }
    return { valid: true };
  }

  verifyVersion(version: PluginVersion): { valid: boolean; reason?: string } {
    if (!version.signature) {
      return { valid: false, reason: "Missing version signature" };
    }
    if (!version.tarballHash) {
      return { valid: false, reason: "Missing tarball hash" };
    }
    return { valid: true };
  }

  verifyIntegrity(plugin: PluginMetadata, version: PluginVersion): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const pluginCheck = this.verifyPlugin(plugin);
    if (!pluginCheck.valid) errors.push(pluginCheck.reason!);
    const versionCheck = this.verifyVersion(version);
    if (!versionCheck.valid) errors.push(versionCheck.reason!);
    return { valid: errors.length === 0, errors };
  }
}
```

- [ ] **Step 7: Create index.ts**

```typescript
// packages/marketplace/src/index.ts
export type { PluginMetadata, PluginVersion, SandboxConfig, AuditEntry } from "./types.js";
export { PluginRegistry } from "./registry.js";
export { PluginSandbox } from "./sandbox.js";
export { SigningVerifier } from "./signing.js";
```

- [ ] **Step 8: Write tests**

```typescript
// packages/marketplace/tests/marketplace.test.ts
import { describe, it, expect } from "vitest";
import { PluginRegistry } from "../src/registry.js";
import { PluginSandbox } from "../src/sandbox.js";
import { SigningVerifier } from "../src/signing.js";
import type { PluginMetadata, PluginVersion } from "../src/types.js";

describe("PluginRegistry", () => {
  it("should register and retrieve plugins", () => {
    const registry = new PluginRegistry();
    const meta: PluginMetadata = { id: "test-plugin", name: "Test", version: "1.0.0", author: "test", description: "A test plugin", category: "agent", certified: true, publishedAt: Date.now(), updatedAt: Date.now() };
    registry.registerPlugin(meta);
    expect(registry.getPlugin("test-plugin")).toEqual(meta);
  });

  it("should list plugins by category", () => {
    const registry = new PluginRegistry();
    registry.registerPlugin({ id: "a", name: "A", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, publishedAt: 0, updatedAt: 0 });
    registry.registerPlugin({ id: "b", name: "B", version: "1.0.0", author: "x", description: "", category: "simulator", certified: true, publishedAt: 0, updatedAt: 0 });
    expect(registry.listPlugins("agent")).toHaveLength(1);
  });

  it("should search plugins by name", () => {
    const registry = new PluginRegistry();
    registry.registerPlugin({ id: "thermal-sim", name: "Thermal Simulator", version: "1.0.0", author: "x", description: "Simulates thermal effects", category: "simulator", certified: true, publishedAt: 0, updatedAt: 0 });
    expect(registry.search("thermal")).toHaveLength(1);
    expect(registry.search("optical")).toHaveLength(0);
  });

  it("should manage plugin versions", () => {
    const registry = new PluginRegistry();
    registry.registerPlugin({ id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, publishedAt: 0, updatedAt: 0 });
    const v1: PluginVersion = { version: "1.0.0", tarballHash: "abc", signature: "sig1", publishedAt: 1, minPlatformVersion: "3.0.0" };
    const v2: PluginVersion = { version: "2.0.0", tarballHash: "def", signature: "sig2", publishedAt: 2, minPlatformVersion: "3.0.0" };
    registry.addVersion("p1", v1);
    registry.addVersion("p1", v2);
    expect(registry.getVersions("p1")).toHaveLength(2);
    expect(registry.getLatestVersion("p1")?.version).toBe("2.0.0");
  });
});

describe("PluginSandbox", () => {
  it("should enforce filesystem restrictions", () => {
    const sandbox = new PluginSandbox();
    sandbox.configure("p1", { filesystemAccess: "read-only" });
    expect(sandbox.canAccessFilesystem("p1", "read")).toBe(true);
    expect(sandbox.canAccessFilesystem("p1", "write")).toBe(false);
  });

  it("should enforce network restrictions", () => {
    const sandbox = new PluginSandbox();
    expect(sandbox.canAccessNetwork("unknown")).toBe(false);
    sandbox.configure("p1", { networkAccess: true });
    expect(sandbox.canAccessNetwork("p1")).toBe(true);
  });

  it("should validate plugin metadata", () => {
    const sandbox = new PluginSandbox();
    const valid = sandbox.validatePlugin({ id: "ok", name: "OK", version: "1.0", author: "me", description: "", category: "agent", certified: true, publishedAt: 0, updatedAt: 0 });
    expect(valid.valid).toBe(true);
    const invalid = sandbox.validatePlugin({ id: "", name: "", version: "", author: "", description: "", category: "agent", certified: false, publishedAt: 0, updatedAt: 0 });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });
});

describe("SigningVerifier", () => {
  it("should verify certified plugins", () => {
    const verifier = new SigningVerifier();
    const meta: PluginMetadata = { id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, signature: "sig", publishedAt: 0, updatedAt: 0 };
    expect(verifier.verifyPlugin(meta).valid).toBe(true);
  });

  it("should reject uncertified plugins", () => {
    const verifier = new SigningVerifier();
    const meta: PluginMetadata = { id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: false, publishedAt: 0, updatedAt: 0 };
    expect(verifier.verifyPlugin(meta).valid).toBe(false);
  });

  it("should verify version integrity", () => {
    const verifier = new SigningVerifier();
    const plugin: PluginMetadata = { id: "p1", name: "P1", version: "1.0.0", author: "x", description: "", category: "agent", certified: true, signature: "sig", publishedAt: 0, updatedAt: 0 };
    const version: PluginVersion = { version: "1.0.0", tarballHash: "abc", signature: "sig", publishedAt: 0, minPlatformVersion: "3.0.0" };
    expect(verifier.verifyIntegrity(plugin, version).valid).toBe(true);
  });
});
```

- [ ] **Step 9: Build and test**

Run: `pnpm --filter @litho/marketplace build && pnpm --filter @litho/marketplace test`

- [ ] **Step 10: Commit**

```bash
git add packages/marketplace/
git commit -m "feat(marketplace): plugin registry, sandbox, and code signing verification"
```

---

## Task 10: 3DIC Multi-Die Package

**Files:**
- Create: `packages/threedic/package.json`
- Create: `packages/threedic/tsconfig.json`
- Create: `packages/threedic/src/types.ts`
- Create: `packages/threedic/src/die-stack.ts`
- Create: `packages/threedic/src/thermal.ts`
- Create: `packages/threedic/src/correction.ts`
- Create: `packages/threedic/src/index.ts`
- Create: `packages/threedic/tests/threedic.test.ts`

- [ ] **Step 1: Create package scaffold and types**

```typescript
// packages/threedic/src/types.ts
export interface DieLayer {
  id: string;
  name: string;
  width: number;
  height: number;
  thickness: number;
  material: string;
  tdp: number;
}

export interface DieStack {
  id: string;
  name: string;
  dies: DieLayer[];
  bondingType: "hybrid" | "face-to-face" | "face-to-back";
  interposer?: { width: number; height: number; material: string };
}

export interface ThermalProfile {
  dieId: string;
  maxTemperature: number;
  hotspotCount: number;
  hotspotLocations: { x: number; y: number; temp: number }[];
  coolingRequired: boolean;
}

export interface MultiDieCorrection {
  dieId: string;
  layer: string;
  epeMap: number[][];
  correctionApplied: boolean;
  thermalDerating: number;
}

export interface ThreeDICConfig {
  maxStackHeight: number;
  thermalThrottleTemp: number;
  interposerConductivity: number;
}
```

- [ ] **Step 2: Write die stack model**

```typescript
// packages/threedic/src/die-stack.ts
import type { DieLayer, DieStack } from "./types.js";

export class DieStackModel {
  private stacks = new Map<string, DieStack>();

  createStack(id: string, name: string, dies: DieLayer[], bondingType: DieStack["bondingType"]): DieStack {
    const stack: DieStack = { id, name, dies, bondingType };
    this.stacks.set(id, stack);
    return stack;
  }

  getStack(id: string): DieStack | undefined {
    return this.stacks.get(id);
  }

  addDie(stackId: string, die: DieLayer, position?: number): void {
    const stack = this.stacks.get(stackId);
    if (!stack) throw new Error(`Stack not found: ${stackId}`);
    if (position !== undefined) {
      stack.dies.splice(position, 0, die);
    } else {
      stack.dies.push(die);
    }
  }

  removeDie(stackId: string, dieId: string): boolean {
    const stack = this.stacks.get(stackId);
    if (!stack) return false;
    const idx = stack.dies.findIndex((d) => d.id === dieId);
    if (idx === -1) return false;
    stack.dies.splice(idx, 1);
    return true;
  }

  getTotalHeight(stackId: string): number {
    const stack = this.stacks.get(stackId);
    if (!stack) return 0;
    return stack.dies.reduce((sum, d) => sum + d.thickness, 0);
  }

  getTotalPower(stackId: string): number {
    const stack = this.stacks.get(stackId);
    if (!stack) return 0;
    return stack.dies.reduce((sum, d) => sum + d.tdp, 0);
  }

  getDieCount(stackId: string): number {
    return this.stacks.get(stackId)?.dies.length ?? 0;
  }
}
```

- [ ] **Step 3: Write thermal simulation**

```typescript
// packages/threedic/src/thermal.ts
import type { DieStack, ThermalProfile, ThreeDICConfig } from "./types.js";

const DEFAULT_CONFIG: ThreeDICConfig = {
  maxStackHeight: 500,
  thermalThrottleTemp: 105,
  interposerConductivity: 150,
};

export class ThermalSimulator {
  private config: ThreeDICConfig;

  constructor(config: Partial<ThreeDICConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  simulate(stack: DieStack): ThermalProfile[] {
    return stack.dies.map((die, idx) => {
      const baseTemp = 25;
      const powerDensity = die.tdp / (die.width * die.height);
      const thermalResistance = die.thickness / (this.config.interposerConductivity * die.width * die.height);
      const maxTemp = baseTemp + die.tdp * thermalResistance + powerDensity * 100;
      const hotspotCount = maxTemp > this.config.thermalThrottleTemp ? 3 : maxTemp > 80 ? 1 : 0;
      const hotspotLocations = Array.from({ length: hotspotCount }, (_, i) => ({
        x: Math.random() * die.width,
        y: Math.random() * die.height,
        temp: maxTemp + Math.random() * 5,
      }));

      return {
        dieId: die.id,
        maxTemperature: maxTemp,
        hotspotCount,
        hotspotLocations,
        coolingRequired: maxTemp > this.config.thermalThrottleTemp,
      };
    });
  }

  getWorstDie(profiles: ThermalProfile[]): ThermalProfile | undefined {
    return profiles.reduce((worst, p) => (p.maxTemperature > (worst?.maxTemperature ?? 0) ? p : worst), undefined as ThermalProfile | undefined);
  }

  needsThrottling(profiles: ThermalProfile[]): boolean {
    return profiles.some((p) => p.maxTemperature > this.config.thermalThrottleTemp);
  }

  getDeratingFactor(temp: number): number {
    if (temp < 70) return 1.0;
    if (temp < 100) return 1.0 - (temp - 70) * 0.01;
    return 0.7;
  }
}
```

- [ ] **Step 4: Write multi-die correction**

```typescript
// packages/threedic/src/correction.ts
import type { DieStack, MultiDieCorrection, ThermalProfile } from "./types.js";

export class MultiDieCorrector {
  correctDie(dieId: string, layer: string, epeMap: number[][], thermalDerating: number): MultiDieCorrection {
    const correctedMap = epeMap.map((row) => row.map((epe) => epe * thermalDerating));
    const maxEpe = Math.max(...correctedMap.flat());
    return {
      dieId,
      layer,
      epeMap: correctedMap,
      correctionApplied: maxEpe < 1.0,
      thermalDerating,
    };
  }

  correctStack(stack: DieStack, layer: string, thermalProfiles: ThermalProfile[]): MultiDieCorrection[] {
    const thermalSim = new Map(thermalProfiles.map((p) => [p.dieId, p]));
    return stack.dies.map((die) => {
      const profile = thermalSim.get(die.id);
      const derating = profile ? (profile.coolingRequired ? 0.85 : 1.0) : 1.0;
      const dummyEpe = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0.5 + Math.random() * 0.5));
      return this.correctDie(die.id, layer, dummyEpe, derating);
    });
  }

  getThermalDerating(profile: ThermalProfile): number {
    if (profile.maxTemperature < 70) return 1.0;
    if (profile.maxTemperature < 100) return 1.0 - (profile.maxTemperature - 70) * 0.01;
    return 0.7;
  }
}
```

- [ ] **Step 5: Create index.ts and package.json**

```typescript
// packages/threedic/src/index.ts
export type { DieLayer, DieStack, ThermalProfile, MultiDieCorrection, ThreeDICConfig } from "./types.js";
export { DieStackModel } from "./die-stack.js";
export { ThermalSimulator } from "./thermal.js";
export { MultiDieCorrector } from "./correction.js";
```

- [ ] **Step 6: Write tests**

```typescript
// packages/threedic/tests/threedic.test.ts
import { describe, it, expect } from "vitest";
import { DieStackModel } from "../src/die-stack.js";
import { ThermalSimulator } from "../src/thermal.js";
import { MultiDieCorrector } from "../src/correction.js";
import type { DieLayer } from "../src/types.js";

const makeDie = (id: string, tdp: number): DieLayer => ({
  id, name: `Die ${id}`, width: 10, height: 10, thickness: 50, material: "silicon", tdp,
});

describe("DieStackModel", () => {
  it("should create and manage stacks", () => {
    const model = new DieStackModel();
    const stack = model.createStack("s1", "Test Stack", [makeDie("d1", 5), makeDie("d2", 8)], "face-to-face");
    expect(stack.dies).toHaveLength(2);
    expect(model.getStack("s1")).toBe(stack);
  });

  it("should add and remove dies", () => {
    const model = new DieStackModel();
    model.createStack("s1", "Stack", [makeDie("d1", 5)], "hybrid");
    model.addDie("s1", makeDie("d2", 3));
    expect(model.getDieCount("s1")).toBe(2);
    model.removeDie("s1", "d2");
    expect(model.getDieCount("s1")).toBe(1);
  });

  it("should calculate total height and power", () => {
    const model = new DieStackModel();
    model.createStack("s1", "Stack", [makeDie("d1", 5), makeDie("d2", 8)], "hybrid");
    expect(model.getTotalHeight("s1")).toBe(100);
    expect(model.getTotalPower("s1")).toBe(13);
  });
});

describe("ThermalSimulator", () => {
  it("should simulate thermal profiles", () => {
    const sim = new ThermalSimulator();
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 5), makeDie("d2", 20)], bondingType: "hybrid" as const };
    const profiles = sim.simulate(stack);
    expect(profiles).toHaveLength(2);
    expect(profiles[0].dieId).toBe("d1");
    expect(profiles[1].dieId).toBe("d2");
  });

  it("should identify worst die", () => {
    const sim = new ThermalSimulator();
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 5), makeDie("d2", 50)], bondingType: "hybrid" as const };
    const profiles = sim.simulate(stack);
    const worst = sim.getWorstDie(profiles);
    expect(worst?.dieId).toBe("d2");
  });

  it("should detect throttling need", () => {
    const sim = new ThermalSimulator({ thermalThrottleTemp: 80 });
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 100)], bondingType: "hybrid" as const };
    const profiles = sim.simulate(stack);
    expect(sim.needsThrottling(profiles)).toBe(true);
  });

  it("should compute derating factor", () => {
    const sim = new ThermalSimulator();
    expect(sim.getDeratingFactor(50)).toBe(1.0);
    expect(sim.getDeratingFactor(85)).toBeLessThan(1.0);
    expect(sim.getDeratingFactor(110)).toBe(0.7);
  });
});

describe("MultiDieCorrector", () => {
  it("should correct die EPE with thermal derating", () => {
    const corrector = new MultiDieCorrector();
    const epe = [[0.5, 0.6], [0.7, 0.8]];
    const result = corrector.correctDie("d1", "Metal1", epe, 0.9);
    expect(result.dieId).toBe("d1");
    expect(result.epeMap[0][0]).toBeCloseTo(0.45);
    expect(result.thermalDerating).toBe(0.9);
  });

  it("should correct full stack", () => {
    const corrector = new MultiDieCorrector();
    const stack = { id: "s1", name: "S", dies: [makeDie("d1", 5), makeDie("d2", 8)], bondingType: "hybrid" as const };
    const profiles = [{ dieId: "d1", maxTemperature: 60, hotspotCount: 0, hotspotLocations: [], coolingRequired: false }, { dieId: "d2", maxTemperature: 90, hotspotCount: 1, hotspotLocations: [], coolingRequired: false }];
    const results = corrector.correctStack(stack, "Metal1", profiles);
    expect(results).toHaveLength(2);
    expect(results[0].thermalDerating).toBe(1.0);
  });
});
```

- [ ] **Step 7: Build and test**

Run: `pnpm --filter @litho/threedic build && pnpm --filter @litho/threedic test`

- [ ] **Step 8: Commit**

```bash
git add packages/threedic/
git commit -m "feat(threedic): multi-die stack model, thermal simulation, and correction"
```

---

## Task 11: Closed-Loop Fab Feedback Package

**Files:**
- Create: `packages/fab-feedback/package.json`
- Create: `packages/fab-feedback/tsconfig.json`
- Create: `packages/fab-feedback/src/types.ts`
- Create: `packages/fab-feedback/src/collector.ts`
- Create: `packages/fab-feedback/src/calibrator.ts`
- Create: `packages/fab-feedback/src/drift-alert.ts`
- Create: `packages/fab-feedback/src/index.ts`
- Create: `packages/fab-feedback/tests/fab-feedback.test.ts`

- [ ] **Step 1: Create package scaffold and types**

```typescript
// packages/fab-feedback/src/types.ts
export interface MetrologyReading {
  id: string;
  toolId: string;
  timestamp: number;
  cdMean: number;
  cdStd: number;
  overlayX: number;
  overlayY: number;
  defectCount: number;
  waferId: string;
  layer: string;
}

export interface DriftAlert {
  id: string;
  toolId: string;
  parameter: string;
  currentValue: number;
  baselineValue: number;
  deviation: number;
  severity: "info" | "warning" | "critical";
  timestamp: number;
}

export interface CalibrationResult {
  toolId: string;
  layer: string;
  correctionFactor: number;
  offsetApplied: number;
  confidence: number;
  timestamp: number;
}

export interface FabFeedbackConfig {
  driftThresholdWarning: number;
  driftThresholdCritical: number;
  calibrationWindow: number;
  minReadingsForCalibration: number;
}
```

- [ ] **Step 2: Write collector**

```typescript
// packages/fab-feedback/src/collector.ts
import type { MetrologyReading } from "./types.js";

export class MetrologyCollector {
  private readings = new Map<string, MetrologyReading[]>();

  addReading(reading: MetrologyReading): void {
    const key = `${reading.toolId}:${reading.layer}`;
    if (!this.readings.has(key)) this.readings.set(key, []);
    this.readings.get(key)!.push(reading);
  }

  getReadings(toolId: string, layer: string): MetrologyReading[] {
    return this.readings.get(`${toolId}:${layer}`) ?? [];
  }

  getRecentReadings(toolId: string, layer: string, count: number): MetrologyReading[] {
    const readings = this.getReadings(toolId, layer);
    return readings.slice(-count);
  }

  getReadingsSince(toolId: string, layer: string, since: number): MetrologyReading[] {
    return this.getReadings(toolId, layer).filter((r) => r.timestamp >= since);
  }

  getAverageCD(toolId: string, layer: string): number {
    const readings = this.getReadings(toolId, layer);
    if (readings.length === 0) return 0;
    return readings.reduce((sum, r) => sum + r.cdMean, 0) / readings.length;
  }

  getReadingCount(toolId: string, layer: string): number {
    return this.getReadings(toolId, layer).length;
  }
}
```

- [ ] **Step 3: Write calibrator**

```typescript
// packages/fab-feedback/src/calibrator.ts
import type { MetrologyReading, CalibrationResult, FabFeedbackConfig } from "./types.js";

const DEFAULT_CONFIG: FabFeedbackConfig = {
  driftThresholdWarning: 2.0,
  driftThresholdCritical: 5.0,
  calibrationWindow: 24 * 60 * 60 * 1000,
  minReadingsForCalibration: 10,
};

export class CalibrationEngine {
  private config: FabFeedbackConfig;
  private calibrationHistory: CalibrationResult[] = [];

  constructor(config: Partial<FabFeedbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  calibrate(toolId: string, layer: string, readings: MetrologyReading[]): CalibrationResult | null {
    if (readings.length < this.config.minReadingsForCalibration) return null;
    const recentWindow = Date.now() - this.config.calibrationWindow;
    const recent = readings.filter((r) => r.timestamp >= recentWindow);
    if (recent.length === 0) return null;
    const avgCd = recent.reduce((sum, r) => sum + r.cdMean, 0) / recent.length;
    const avgOverlay = recent.reduce((sum, r) => sum + Math.sqrt(r.overlayX ** 2 + r.overlayY ** 2), 0) / recent.length;
    const targetCd = 20;
    const correctionFactor = targetCd / avgCd;
    const offsetApplied = targetCd - avgCd;
    const confidence = Math.max(0, Math.min(1, 1 - avgOverlay / 10));
    const result: CalibrationResult = { toolId, layer, correctionFactor, offsetApplied, confidence, timestamp: Date.now() };
    this.calibrationHistory.push(result);
    return result;
  }

  getHistory(toolId?: string, layer?: string): CalibrationResult[] {
    let results = this.calibrationHistory;
    if (toolId) results = results.filter((r) => r.toolId === toolId);
    if (layer) results = results.filter((r) => r.layer === layer);
    return results;
  }

  getLatest(toolId: string, layer: string): CalibrationResult | undefined {
    return this.getHistory(toolId, layer).at(-1);
  }
}
```

- [ ] **Step 4: Write drift alerting**

```typescript
// packages/fab-feedback/src/drift-alert.ts
import type { MetrologyReading, DriftAlert, FabFeedbackConfig } from "./types.js";

const DEFAULT_CONFIG: FabFeedbackConfig = {
  driftThresholdWarning: 2.0,
  driftThresholdCritical: 5.0,
  calibrationWindow: 24 * 60 * 60 * 1000,
  minReadingsForCalibration: 10,
};

export class DriftDetector {
  private config: FabFeedbackConfig;
  private alerts: DriftAlert[] = [];
  private baselines = new Map<string, number>();

  constructor(config: Partial<FabFeedbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setBaseline(toolId: string, layer: string, cdMean: number): void {
    this.baselines.set(`${toolId}:${layer}`, cdMean);
  }

  getBaseline(toolId: string, layer: string): number | undefined {
    return this.baselines.get(`${toolId}:${layer}`);
  }

  detectDrift(reading: MetrologyReading): DriftAlert | null {
    const key = `${reading.toolId}:${reading.layer}`;
    const baseline = this.baselines.get(key);
    if (baseline === undefined) return null;
    const deviation = Math.abs(reading.cdMean - baseline);
    const deviationPercent = (deviation / baseline) * 100;
    let severity: DriftAlert["severity"] = "info";
    if (deviationPercent >= this.config.driftThresholdCritical) severity = "critical";
    else if (deviationPercent >= this.config.driftThresholdWarning) severity = "warning";
    if (severity === "info") return null;
    const alert: DriftAlert = {
      id: `drift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      toolId: reading.toolId,
      parameter: "cd_mean",
      currentValue: reading.cdMean,
      baselineValue: baseline,
      deviation: deviationPercent,
      severity,
      timestamp: Date.now(),
    };
    this.alerts.push(alert);
    return alert;
  }

  getAlerts(severity?: DriftAlert["severity"]): DriftAlert[] {
    if (severity) return this.alerts.filter((a) => a.severity === severity);
    return [...this.alerts];
  }

  clearAlerts(): void {
    this.alerts = [];
  }
}
```

- [ ] **Step 5: Create index.ts**

```typescript
// packages/fab-feedback/src/index.ts
export type { MetrologyReading, DriftAlert, CalibrationResult, FabFeedbackConfig } from "./types.js";
export { MetrologyCollector } from "./collector.js";
export { CalibrationEngine } from "./calibrator.js";
export { DriftDetector } from "./drift-alert.js";
```

- [ ] **Step 6: Write tests**

```typescript
// packages/fab-feedback/tests/fab-feedback.test.ts
import { describe, it, expect } from "vitest";
import { MetrologyCollector } from "../src/collector.js";
import { CalibrationEngine } from "../src/calibrator.js";
import { DriftDetector } from "../src/drift-alert.js";
import type { MetrologyReading } from "../src/types.js";

const makeReading = (toolId: string, layer: string, cdMean: number, ts?: number): MetrologyReading => ({
  id: `r-${Date.now()}`, toolId, timestamp: ts ?? Date.now(), cdMean, cdStd: 0.1, overlayX: 0.5, overlayY: 0.3, defectCount: 0, waferId: "w1", layer,
});

describe("MetrologyCollector", () => {
  it("should collect and retrieve readings", () => {
    const collector = new MetrologyCollector();
    collector.addReading(makeReading("tool1", "Metal1", 20.1));
    collector.addReading(makeReading("tool1", "Metal1", 20.3));
    expect(collector.getReadings("tool1", "Metal1")).toHaveLength(2);
    expect(collector.getAverageCD("tool1", "Metal1")).toBeCloseTo(20.2);
  });

  it("should return recent readings", () => {
    const collector = new MetrologyCollector();
    for (let i = 0; i < 10; i++) collector.addReading(makeReading("t1", "M1", 20 + i * 0.1));
    const recent = collector.getRecentReadings("t1", "M1", 3);
    expect(recent).toHaveLength(3);
  });
});

describe("CalibrationEngine", () => {
  it("should calibrate with enough readings", () => {
    const engine = new CalibrationEngine({ minReadingsForCalibration: 5 });
    const readings = Array.from({ length: 10 }, (_, i) => makeReading("t1", "M1", 20 + i * 0.1, Date.now() - (10 - i) * 1000));
    const result = engine.calibrate("t1", "M1", readings);
    expect(result).not.toBeNull();
    expect(result!.toolId).toBe("t1");
    expect(result!.confidence).toBeGreaterThan(0);
  });

  it("should return null with insufficient readings", () => {
    const engine = new CalibrationEngine({ minReadingsForCalibration: 20 });
    const result = engine.calibrate("t1", "M1", [makeReading("t1", "M1", 20)]);
    expect(result).toBeNull();
  });

  it("should track calibration history", () => {
    const engine = new CalibrationEngine({ minReadingsForCalibration: 1 });
    engine.calibrate("t1", "M1", [makeReading("t1", "M1", 20)]);
    engine.calibrate("t1", "M1", [makeReading("t1", "M1", 20.1)]);
    expect(engine.getHistory("t1")).toHaveLength(2);
    expect(engine.getLatest("t1", "M1")?.confidence).toBeGreaterThan(0);
  });
});

describe("DriftDetector", () => {
  it("should detect drift when exceeding threshold", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 1.0 });
    detector.setBaseline("t1", "M1", 20.0);
    const alert = detector.detectDrift(makeReading("t1", "M1", 21.5));
    expect(alert).not.toBeNull();
    expect(alert!.severity).toBe("warning");
  });

  it("should not alert within threshold", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 5.0 });
    detector.setBaseline("t1", "M1", 20.0);
    const alert = detector.detectDrift(makeReading("t1", "M1", 20.5));
    expect(alert).toBeNull();
  });

  it("should detect critical drift", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 2.0, driftThresholdCritical: 5.0 });
    detector.setBaseline("t1", "M1", 20.0);
    const alert = detector.detectDrift(makeReading("t1", "M1", 22.0));
    expect(alert?.severity).toBe("critical");
  });

  it("should track alert history", () => {
    const detector = new DriftDetector({ driftThresholdWarning: 1.0 });
    detector.setBaseline("t1", "M1", 20.0);
    detector.detectDrift(makeReading("t1", "M1", 22.0));
    detector.detectDrift(makeReading("t1", "M1", 23.0));
    expect(detector.getAlerts()).toHaveLength(2);
    expect(detector.getAlerts("critical")).toHaveLength(2);
  });
});
```

- [ ] **Step 7: Build and test**

Run: `pnpm --filter @litho/fab-feedback build && pnpm --filter @litho/fab-feedback test`

- [ ] **Step 8: Commit**

```bash
git add packages/fab-feedback/
git commit -m "feat(fab-feedback): metrology collector, calibration engine, and drift alerting"
```

---

## Task 12: White-Label Report Engine

**Files:**
- Create: `packages/reporting/src/whitelabel.ts`
- Create: `packages/reporting/tests/whitelabel.test.ts`

- [ ] **Step 1: Write white-label renderer**

```typescript
// packages/reporting/src/whitelabel.ts
export interface WhiteLabelConfig {
  companyName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  footerText: string;
  includeTimestamp: boolean;
  watermarked: boolean;
}

const DEFAULT_CONFIG: WhiteLabelConfig = {
  companyName: "LithoMind",
  primaryColor: "#1a56db",
  secondaryColor: "#6b7280",
  fontFamily: "Inter, sans-serif",
  footerText: "Generated by LithoMind AI",
  includeTimestamp: true,
  watermarked: false,
};

export class WhiteLabelRenderer {
  private config: WhiteLabelConfig;

  constructor(config: Partial<WhiteLabelConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  renderHeader(title: string): string {
    const logo = this.config.logo ? `<img src="${this.config.logo}" alt="Logo" height="40"> ` : "";
    return `<div style="font-family:${this.config.fontFamily};border-bottom:2px solid ${this.config.primaryColor};padding-bottom:12px;margin-bottom:24px">${logo}<h1 style="color:${this.config.primaryColor};margin:0">${title}</h1><p style="color:${this.config.secondaryColor};margin:4px 0 0">${this.config.companyName}</p></div>`;
  }

  renderFooter(): string {
    const ts = this.config.includeTimestamp ? ` | ${new Date().toISOString()}` : "";
    const watermark = this.config.watermarked ? `<span style="opacity:0.3;position:absolute;right:20px;bottom:20px;transform:rotate(-45deg);font-size:48px">${this.config.companyName}</span>` : "";
    return `<div style="font-family:${this.config.fontFamily};border-top:1px solid #e5e7eb;padding-top:12px;margin-top:24px;color:${this.config.secondaryColor};font-size:12px">${this.config.footerText}${ts}</div>${watermark}`;
  }

  renderSection(title: string, content: string): string {
    return `<div style="font-family:${this.config.fontFamily};margin-bottom:24px"><h2 style="color:${this.config.primaryColor};font-size:18px;margin-bottom:8px">${title}</h2><div>${content}</div></div>`;
  }

  renderTable(headers: string[], rows: string[][]): string {
    const headerRow = headers.map((h) => `<th style="background:${this.config.primaryColor};color:white;padding:8px 12px;text-align:left">${h}</th>`).join("");
    const bodyRows = rows.map((row) => `<tr>${row.map((c) => `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${c}</td>`).join("")}</tr>`).join("");
    return `<table style="width:100%;border-collapse:collapse;font-family:${this.config.fontFamily}"><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  }

  renderFullReport(title: string, sections: { title: string; content: string }[]): string {
    const header = this.renderHeader(title);
    const body = sections.map((s) => this.renderSection(s.title, s.content)).join("");
    const footer = this.renderFooter();
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="max-width:800px;margin:0 auto;padding:40px">${header}${body}${footer}</body></html>`;
  }

  getConfig(): WhiteLabelConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<WhiteLabelConfig>): void {
    Object.assign(this.config, updates);
  }
}
```

- [ ] **Step 2: Update index.ts**

Add to `packages/reporting/src/index.ts`:
```typescript
export { WhiteLabelRenderer } from "./whitelabel.js";
export type { WhiteLabelConfig } from "./whitelabel.js";
```

- [ ] **Step 3: Write tests**

```typescript
// packages/reporting/tests/whitelabel.test.ts
import { describe, it, expect } from "vitest";
import { WhiteLabelRenderer } from "../src/whitelabel.js";

describe("WhiteLabelRenderer", () => {
  it("should render header with company name", () => {
    const renderer = new WhiteLabelRenderer({ companyName: "Acme Litho" });
    const html = renderer.renderHeader("Test Report");
    expect(html).toContain("Acme Litho");
    expect(html).toContain("Test Report");
  });

  it("should render footer with timestamp", () => {
    const renderer = new WhiteLabelRenderer({ includeTimestamp: true });
    const html = renderer.renderFooter();
    expect(html).toContain("Generated by LithoMind");
    expect(html).toContain("20");
  });

  it("should render table", () => {
    const renderer = new WhiteLabelRenderer();
    const html = renderer.renderTable(["Name", "Score"], [["OPC", "95"], ["ILT", "88"]]);
    expect(html).toContain("<table");
    expect(html).toContain("OPC");
    expect(html).toContain("95");
  });

  it("should render full report", () => {
    const renderer = new WhiteLabelRenderer();
    const html = renderer.renderFullReport("My Report", [{ title: "Section 1", content: "Content here" }]);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("My Report");
    expect(html).toContain("Section 1");
  });

  it("should update config", () => {
    const renderer = new WhiteLabelRenderer();
    renderer.updateConfig({ companyName: "NewCo", primaryColor: "#ff0000" });
    expect(renderer.getConfig().companyName).toBe("NewCo");
    expect(renderer.getConfig().primaryColor).toBe("#ff0000");
  });
});
```

- [ ] **Step 4: Build and test**

Run: `pnpm --filter @litho/reporting build && pnpm --filter @litho/reporting test`

- [ ] **Step 5: Commit**

```bash
git add packages/reporting/src/whitelabel.ts packages/reporting/src/index.ts packages/reporting/tests/whitelabel.test.ts
git commit -m "feat(reporting): white-label report renderer with configurable branding"
```

---

## Task 13: Full Build & Test Verification

- [ ] **Step 1: Build all packages**

Run: `pnpm build`

- [ ] **Step 2: Run all tests**

Run: `pnpm test`

- [ ] **Step 3: Verify all 25 packages have 0 build errors**

Expected: All 25 packages build successfully.

- [ ] **Step 4: Final commit with summary**

```bash
git add -A
git commit -m "feat: Phase 3 complete — NLI v3, 3 PDKs, marketplace, 3DIC, fab-feedback, white-label

Phase 3 deliverables:
- Intel 18A, GF 22FDX, UMC 22nm PDKs (5 foundries total)
- NLI v3 conversational with multi-turn memory and clarification
- Plugin Marketplace with registry, sandbox, and code signing
- 3DIC multi-die stack model, thermal simulation, correction
- Closed-loop fab feedback: metrology collector, calibration, drift alerting
- White-label report renderer with configurable branding"
```

---

## Summary

| Sub-Project | Package | Tests | Status |
|---|---|---|---|
| Intel 18A PDK | `@litho/pdk` (extended) | +2 | Task 1 |
| GF 22FDX PDK | `@litho/pdk` (extended) | +2 | Task 2 |
| UMC 22nm PDK | `@litho/pdk` (extended) | +2 | Task 3 |
| NLI v3 Conversational | `@litho/nli-v3` (new) | 15 | Tasks 4-8 |
| Plugin Marketplace | `@litho/marketplace` (new) | 8 | Task 9 |
| 3DIC Multi-Die | `@litho/threedic` (new) | 9 | Task 10 |
| Closed-Loop Fab Feedback | `@litho/fab-feedback` (new) | 10 | Task 11 |
| White-Label Reports | `@litho/reporting` (extended) | 5 | Task 12 |

**Total new tests: 53** across 4 new packages + 2 extended packages.

**Grand total after Phase 3: ~246 tests across 28 packages.**
