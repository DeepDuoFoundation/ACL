export interface NLIConfig {
  maxContextLength: number;
  confidenceThreshold: number;
  enableMultiTurn: boolean;
  supportedIntents: string[];
}

export interface ConversationState {
  sessionId: string;
  userId: string;
  history: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>;
  context: Map<string, unknown>;
  currentIntent?: UserIntent;
  turnCount: number;
}

export interface UserIntent {
  name: string;
  confidence: number;
  slots: Record<string, unknown>;
  requiresConfirmation: boolean;
}

export interface NLIResponse {
  message: string;
  intent: UserIntent;
  actions: Array<{ type: string; target: string; parameters: Record<string, unknown> }>;
  suggestions: string[];
  confidence: number;
}
