import React from "react"
import { Box, Text } from "ink"

export interface CommandItem {
  cmd: string
  desc: string
}

export const SLASH_COMMANDS: CommandItem[] = [
  { cmd: "/agents", desc: "Switch autonomous agent / OPC execution mode" },
  { cmd: "/connect", desc: "Connect DDF AI Gateway provider or update API Key" },
  { cmd: "/models", desc: "Switch active LLM model (Claude 3.5 Sonnet, GPT-4o)" },
  { cmd: "/debug", desc: "View diagnostic trace & fab telemetry logs" },
  { cmd: "/diff", desc: "Open job diff viewer & layout comparison" },
  { cmd: "/capabilities", desc: "Sync LithoMind MCPs, PDKs, and Fab Skills" },
  { cmd: "/history", desc: "View session history & OPC run logs" },
  { cmd: "/clear", desc: "Clear terminal screen & chat buffer" },
  { cmd: "/logout", desc: "Log out from DDF AI Gateway session" },
  { cmd: "/help", desc: "Display CLI help reference" },
  { cmd: "/exit", desc: "Exit LithoMind CLI" },
]

interface SlashPopupProps {
  filterText: string
  selectedIndex: number
}

export function SlashPopup({ filterText, selectedIndex }: SlashPopupProps) {
  const query = filterText.toLowerCase()
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

  const itemsToDisplay = filtered.slice(0, 8)
  const safeIndex = Math.min(selectedIndex, itemsToDisplay.length - 1)

  return (
    <Box
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      paddingY={0}
      flexDirection="column"
      marginBottom={0}
    >
      {itemsToDisplay.map((item, idx) => {
        const isSelected = idx === safeIndex
        return (
          <Box key={item.cmd} justifyContent="space-between" width={68}>
            <Box gap={2}>
              <Text bold color={isSelected ? "black" : "cyan"} backgroundColor={isSelected ? "cyan" : undefined}>
                {item.cmd.padEnd(12)}
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
