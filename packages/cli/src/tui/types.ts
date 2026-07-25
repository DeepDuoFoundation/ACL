export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

export interface TuiState {
  messages: ChatMessage[]
  processing: boolean
  sessionId: string
  apiKey: string
  product: string
}
