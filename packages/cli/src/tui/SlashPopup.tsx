import React from "react"
import { Box, Text } from "ink"

export interface CommandItem {
  cmd: string
  desc: string
}

export const SLASH_COMMANDS: CommandItem[] = [
  { cmd: "/agents", desc: "Select & switch OPC/ILT agent mode (Build, Plan, Ask, ILT, EPE)" },
  { cmd: "/models", desc: "Select & switch foundation model (Claude 3.5, DeepSeek V4, GPT-4o)" },
  { cmd: "/capabilities", desc: "View & sync LithoMind PDKs, Skills, MCPs, and Fab Connectors" },
  { cmd: "/connect", desc: "Connect DDF AI Gateway provider or verify authentication" },
  { cmd: "/debug", desc: "View diagnostic trace & fab telemetry logs" },
  { cmd: "/diff", desc: "Open job diff viewer & layout comparison" },
  { cmd: "/history", desc: "View session history & OPC run logs" },
  { cmd: "/clear", desc: "Clear terminal screen & buffer" },
  { cmd: "/logout", desc: "Log out from DDF AI Gateway session" },
  { cmd: "/help", desc: "Display CLI command reference" },
  { cmd: "/exit", desc: "Exit LithoMind CLI" },
]

export const AVAILABLE_MODELS = [
  { name: "Anthropic Claude 3.5 Sonnet", desc: "High reasoning for complex OPC & ILT lithography" },
  { name: "DeepSeek V4 Flash Free", desc: "Fast neural engine layout processing & rule checks" },
  { name: "OpenAI GPT-4o Enterprise", desc: "General multimodal coding & digital twin analysis" },
  { name: "LithoMind Fine-tuned 7B", desc: "Specialized computational lithography model" },
]

export const AVAILABLE_AGENTS = [
  { name: "Build (Full Agentic)", desc: "Autonomous OPC & curvilinear ILT mask synthesis" },
  { name: "Plan (Architect)", desc: "Lithography process window & yield planning" },
  { name: "Ask (Q&A)", desc: "Interactive Q&A for OPC, EPE, and fab scanner rules" },
  { name: "Curvilinear ILT Synthesizer", desc: "Inverse Lithography inverse Maxwell solver" },
  { name: "EPE Hotspot Verifier", desc: "Edge Placement Error automated scanner audit" },
]

export const AVAILABLE_CAPABILITIES = [
  { name: "Sub-10nm OPC Neural Engine", status: "Active", category: "OPC Engine" },
  { name: "Inverse Lithography (ILT) Synthesizer", status: "Active", category: "Mask Solver" },
  { name: "Fab Digital Twin Telemetry Scanner", status: "Active", category: "Fab Twin" },
  { name: "Edge Placement Error (EPE) Verifier", status: "Active", category: "Quality" },
  { name: "DDF AI Gateway Multi-Model Router", status: "Active", category: "AI Gateway" },
]

interface SlashPopupProps {
  filterText: string
  selectedIndex: number
}

export function SlashPopup({ filterText, selectedIndex }: SlashPopupProps) {
  const cleanInput = filterText.trim().toLowerCase()

  // 1. Sub-menu for /models
  if (cleanInput === "/models" || cleanInput.startsWith("/models ")) {
    return (
      <Box borderStyle="round" borderColor="cyan" paddingX={1} paddingY={0} flexDirection="column" width={80}>
        <Box marginBottom={1}>
          <Text bold color="yellow">🧠 Select Foundation Model (Use Up/Down arrows & Enter):</Text>
        </Box>
        {AVAILABLE_MODELS.map((item, idx) => {
          const isSelected = idx === Math.min(selectedIndex, AVAILABLE_MODELS.length - 1)
          return (
            <Box key={item.name} justifyContent="space-between" width={76}>
              <Box gap={2}>
                <Text bold color={isSelected ? "black" : "cyan"} backgroundColor={isSelected ? "cyan" : undefined}>
                  {` ${isSelected ? "❯ " : "  "}${item.name.padEnd(28)}`}
                </Text>
                <Text color={isSelected ? "black" : "white"} backgroundColor={isSelected ? "cyan" : undefined}>
                  {item.desc}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  // 2. Sub-menu for /agents
  if (cleanInput === "/agents" || cleanInput.startsWith("/agents ")) {
    return (
      <Box borderStyle="round" borderColor="cyan" paddingX={1} paddingY={0} flexDirection="column" width={80}>
        <Box marginBottom={1}>
          <Text bold color="yellow">🔄 Select LithoMind Agent Mode (Use Up/Down arrows & Enter):</Text>
        </Box>
        {AVAILABLE_AGENTS.map((item, idx) => {
          const isSelected = idx === Math.min(selectedIndex, AVAILABLE_AGENTS.length - 1)
          return (
            <Box key={item.name} justifyContent="space-between" width={76}>
              <Box gap={2}>
                <Text bold color={isSelected ? "black" : "cyan"} backgroundColor={isSelected ? "cyan" : undefined}>
                  {` ${isSelected ? "❯ " : "  "}${item.name.padEnd(28)}`}
                </Text>
                <Text color={isSelected ? "black" : "white"} backgroundColor={isSelected ? "cyan" : undefined}>
                  {item.desc}
                </Text>
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  // 3. Sub-menu for /capabilities
  if (cleanInput === "/capabilities" || cleanInput.startsWith("/capabilities ")) {
    return (
      <Box borderStyle="round" borderColor="cyan" paddingX={1} paddingY={0} flexDirection="column" width={80}>
        <Box marginBottom={1}>
          <Text bold color="yellow">⚡ Active LithoMind PDKs, Skills & MCP Connectors:</Text>
        </Box>
        {AVAILABLE_CAPABILITIES.map((item, idx) => {
          const isSelected = idx === Math.min(selectedIndex, AVAILABLE_CAPABILITIES.length - 1)
          return (
            <Box key={item.name} justifyContent="space-between" width={76}>
              <Box gap={2}>
                <Text bold color={isSelected ? "black" : "green"} backgroundColor={isSelected ? "green" : undefined}>
                  {` ${isSelected ? "❯ " : "  "}${item.name.padEnd(36)}`}
                </Text>
                <Text bold color={isSelected ? "black" : "cyan"} backgroundColor={isSelected ? "green" : undefined}>
                  {`[${item.category}]`}
                </Text>
              </Box>
              <Text bold color={isSelected ? "black" : "green"} backgroundColor={isSelected ? "green" : undefined}>
                {item.status}
              </Text>
            </Box>
          )
        })}
      </Box>
    )
  }

  // 4. Default Slash Command Popup (Show ALL commands)
  const query = filterText.startsWith("/") ? filterText.slice(1).toLowerCase() : filterText.toLowerCase()
  const filtered = SLASH_COMMANDS.filter(
    (item) => item.cmd.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query),
  )

  if (filtered.length === 0) {
    return (
      <Box borderStyle="round" borderColor="yellow" paddingX={1} marginBottom={1} flexDirection="column">
        <Text color="yellow">No commands matching "{filterText}"</Text>
      </Box>
    )
  }

  const safeIndex = Math.min(selectedIndex, filtered.length - 1)

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      paddingY={0}
      flexDirection="column"
      marginBottom={0}
      width={84}
    >
      <Box marginBottom={0}>
        <Text dimColor color="cyan">Press Enter or Tab to select a command:</Text>
      </Box>
      {filtered.map((item, idx) => {
        const isSelected = idx === safeIndex
        return (
          <Box key={item.cmd} justifyContent="space-between" width={80}>
            <Box gap={2}>
              <Text bold color={isSelected ? "black" : "cyan"} backgroundColor={isSelected ? "cyan" : undefined}>
                {` ${isSelected ? "❯ " : "  "}${item.cmd.padEnd(14)}`}
              </Text>
              <Text bold color={isSelected ? "black" : "white"} backgroundColor={isSelected ? "cyan" : undefined}>
                {item.desc}
              </Text>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
