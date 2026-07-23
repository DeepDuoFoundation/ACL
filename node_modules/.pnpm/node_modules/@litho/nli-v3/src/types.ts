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