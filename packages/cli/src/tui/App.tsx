import React, { useState, useCallback } from "react"
import { Box, useApp } from "ink"
import { HeaderBanner } from "./HeaderBanner.js"
import { Conversation } from "./Conversation.js"
import { CommandInput } from "./CommandInput.js"
import { StatusBar } from "./StatusBar.js"
import { NLIV3Engine } from "@litho/nli-v3"
import { AuthFlow } from "@litho/security"
import type { ChatMessage } from "./types.js"

interface AppProps {
  apiKey: string
  email?: string
  tier?: string
  product?: string
}

let msgId = 0
function nextId(): string {
  return `msg_${Date.now()}_${++msgId}`
}

const nli = new NLIV3Engine()
const sessionId = `cli_${Date.now()}`
const authFlow = new AuthFlow()

export function App({ apiKey, email, tier, product = "LithoMind" }: AppProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome_0",
      role: "assistant",
      content: "Welcome to LithoMind AI TUI! Type your query, execute OPC/ILT jobs, or type `/` for available commands.",
      timestamp: Date.now(),
    },
  ])
  const [processing, setProcessing] = useState(false)
  const { exit } = useApp()

  const handleSend = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, userMsg])
      setProcessing(true)

      try {
        const lower = text.toLowerCase().trim()
        if (lower === "exit" || lower === "/exit" || lower === "quit") {
          setProcessing(false)
          exit()
          return
        }

        if (lower === "clear" || lower === "/clear") {
          setMessages([])
          setProcessing(false)
          return
        }

        if (lower === "logout" || lower === "/logout") {
          await authFlow.logout()
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: "assistant",
              content: "✓ Logged out successfully from DDF AI Gateway.",
              timestamp: Date.now(),
            },
          ])
          setProcessing(false)
          return
        }

        if (lower === "/help") {
          setMessages((prev) => [
            ...prev,
            {
              id: nextId(),
              role: "assistant",
              content: `Available Commands:
  • /agents      - Switch autonomous agent execution mode
  • /connect     - Connect DDF AI Gateway provider or update API Key
  • /models      - Switch active LLM model
  • /capabilities- Sync LithoMind MCPs, PDKs, and Fab Skills
  • /history     - View session history & OPC run logs
  • /clear       - Clear terminal screen
  • /logout      - Log out from DDF AI Gateway session
  • /exit        - Exit LithoMind CLI`,
              timestamp: Date.now(),
            },
          ])
          setProcessing(false)
          return
        }

        const response = await nli.processMessage(sessionId, "cli-user", text)
        const assistantMsg: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: response.message,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            content: `Error: ${err.message || "Processing failed"}`,
            timestamp: Date.now(),
          },
        ])
      }
      setProcessing(false)
    },
    [exit],
  )

  return (
    <Box flexDirection="column" paddingX={1} paddingY={0}>
      <HeaderBanner title="LITHOMIND AI" subtitle="Agentic Computational Lithography Platform" />
      <Box flexDirection="column" flexGrow={1} minHeight={6}>
        <Conversation messages={messages} processing={processing} />
      </Box>
      <CommandInput onSend={handleSend} disabled={processing} modelName="Anthropic Claude 3.5 Sonnet" />
      <StatusBar email={email} tier={tier} product={product} />
    </Box>
  )
}
