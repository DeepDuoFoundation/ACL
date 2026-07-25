import { Text, Box } from "ink"
import { MarkdownRenderer } from "./MarkdownRenderer.js"
import type { ChatMessage } from "./types.js"

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

export function Conversation({ messages, processing }: { messages: ChatMessage[]; processing: boolean }) {
  return (
    <Box flexDirection="column" paddingX={1}>
      {messages.length === 0 ? (
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="cyan">
            {"╔══════════════════════════════════════════╗"}
          </Text>
          <Text bold color="cyan">
            {"║  LithoMind AI — Agentic Lithography CLI  ║"}
          </Text>
          <Text bold color="cyan">
            {"╚══════════════════════════════════════════╝"}
          </Text>
          <Box marginTop={1}>
            <Text dimColor>Type a message to start. Try "run OPC correction" or "help".</Text>
          </Box>
        </Box>
      ) : (
        messages.map((msg) => (
          <Box key={msg.id} flexDirection="column" marginTop={1}>
            <Box>
              <Text bold color={msg.role === "user" ? "green" : "cyan"}>
                {msg.role === "user" ? "▸ You" : "◆ Litho"}
              </Text>
              <Text dimColor>{" "}{formatTime(msg.timestamp)}</Text>
            </Box>
            <Box marginLeft={2} marginTop={1}>
              <Text>
                {msg.role === "user" ? (
                  msg.content
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </Text>
            </Box>
          </Box>
        ))
      )}
      {processing && (
        <Box marginTop={1}>
          <Text color="yellow">⟳ Processing...</Text>
        </Box>
      )}
    </Box>
  )
}
