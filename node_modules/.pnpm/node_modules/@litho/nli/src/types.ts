export interface Intent {
  name: string;
  confidence: number;
  slots: Slot[];
}

export interface Slot {
  name: string;
  value: string | number;
  confidence: number;
}

export interface ConversationContext {
  sessionId: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  currentIntent?: Intent;
  extractedSlots: Map<string, Slot>;
}

export interface NLIConfig {
  modelEndpoint?: string;
  maxSlots: number;
  confidenceThreshold: number;
}
