import React, { useState } from "react"
import { Text, Box, useInput } from "ink"
import { SlashPopup, SLASH_COMMANDS } from "./SlashPopup.js"

interface CommandInputProps {
  onSend: (text: string) => void
  disabled: boolean
  modelName?: string
}

export function CommandInput({ onSend, disabled, modelName = "Anthropic Claude 3.5 Sonnet" }: CommandInputProps) {
  const [value, setValue] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const isSlashCommand = value.startsWith("/")
  const query = value.toLowerCase()
  const filteredCommands = SLASH_COMMANDS.filter(
    (item) => item.cmd.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query),
  )

  useInput((input, key) => {
    if (disabled) return

    if (isSlashCommand && filteredCommands.length > 0) {
      if (key.upArrow) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1))
        return
      }
      if (key.downArrow) {
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0))
        return
      }
      if (key.tab) {
        const selectedCmd = filteredCommands[selectedIndex] || filteredCommands[0]
        if (selectedCmd) {
          setValue(selectedCmd.cmd + " ")
        }
        return
      }
    }

    if (key.return) {
      const trimmed = value.trim()
      if (trimmed) {
        if (isSlashCommand && filteredCommands.length > 0) {
          const selectedCmd = filteredCommands[Math.min(selectedIndex, filteredCommands.length - 1)]
          onSend(selectedCmd ? selectedCmd.cmd : trimmed)
        } else {
          onSend(trimmed)
        }
        setValue("")
        setSelectedIndex(0)
      }
    } else if (key.backspace || key.delete) {
      setValue((v) => v.slice(0, -1))
      setSelectedIndex(0)
    } else if (!key.ctrl && !key.meta && !key.shift && input.length === 1) {
      setValue((v) => v + input)
      setSelectedIndex(0)
    }
  })

  return (
    <Box flexDirection="column" marginTop={1}>
      {/* Slash command autocomplete popup menu */}
      {isSlashCommand && <SlashPopup filterText={value} selectedIndex={selectedIndex} />}

      {/* Main prompt input box matching OpenCode & MiMoCode TUI */}
      <Box borderStyle="round" borderColor="cyan" flexDirection="column" paddingX={1} paddingY={0}>
        <Box gap={1}>
          <Text bold color="cyan">│</Text>
          <Text color={value ? "white" : "gray"}>
            {value || 'Type your message... (type / for commands)'}
            {disabled ? "" : "█"}
          </Text>
        </Box>
        <Box gap={1} marginTop={0}>
          <Text bold color="cyan">Build</Text>
          <Text color="gray">•</Text>
          <Text bold color="white">{modelName}</Text>
          <Text color="gray">•</Text>
          <Text color="gray">DDF Gateway</Text>
          <Text color="gray">•</Text>
          <Text bold color="yellow">high</Text>
        </Box>
      </Box>

      {/* Hotkey hint bar */}
      <Box gap={2} paddingX={1} marginTop={0}>
        <Box gap={1}>
          <Text bold color="black" backgroundColor="gray"> tab </Text>
          <Text dimColor>agents</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="black" backgroundColor="gray"> ctrl+p </Text>
          <Text dimColor>commands</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="cyan">@</Text>
          <Text dimColor>attach file</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="green">$</Text>
          <Text dimColor>subagent</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="yellow">/</Text>
          <Text dimColor>commands</Text>
        </Box>
      </Box>

      {/* Tip Banner Line */}
      <Box paddingX={1} marginTop={0} gap={1}>
        <Text color="yellow">● Tip</Text>
        <Text dimColor>Use</Text>
        <Text bold color="cyan">/capabilities</Text>
        <Text dimColor>to sync PDKs or</Text>
        <Text bold color="cyan">/help</Text>
        <Text dimColor>for CLI reference</Text>
      </Box>
    </Box>
  )
}
