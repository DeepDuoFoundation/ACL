import React, { useState } from "react"
import { Text, Box, useInput } from "ink"
import { SlashPopup, SLASH_COMMANDS } from "./SlashPopup.js"

interface CommandInputProps {
  onSend: (text: string) => void
  disabled: boolean
  modelName?: string
  activeMode?: string
}

export function CommandInput({
  onSend,
  disabled,
  modelName = "Anthropic Claude 3.5 Sonnet",
  activeMode = "Build",
}: CommandInputProps) {
  const [value, setValue] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showPopup, setShowPopup] = useState(false)

  const isSlashCommand = value.startsWith("/") || showPopup
  const query = value.startsWith("/") ? value.slice(1).toLowerCase() : value.toLowerCase()
  const filteredCommands = SLASH_COMMANDS.filter(
    (item) => item.cmd.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query),
  )

  useInput((input, key) => {
    if (disabled) return

    // Ctrl+P opens slash commands list
    if (key.ctrl && input.toLowerCase() === "p") {
      setShowPopup((prev) => !prev)
      if (!value.startsWith("/")) setValue("/")
      return
    }

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
          setShowPopup(false)
        }
        return
      }
    }

    if (key.return) {
      const trimmed = value.trim()
      if (trimmed) {
        if (isSlashCommand && filteredCommands.length > 0 && showPopup) {
          const selectedCmd = filteredCommands[Math.min(selectedIndex, filteredCommands.length - 1)]
          onSend(selectedCmd ? selectedCmd.cmd : trimmed)
        } else {
          onSend(trimmed)
        }
        setValue("")
        setShowPopup(false)
        setSelectedIndex(0)
      }
    } else if (key.backspace || key.delete) {
      setValue((v) => {
        const next = v.slice(0, -1)
        if (!next.startsWith("/")) setShowPopup(false)
        return next
      })
      setSelectedIndex(0)
    } else if (!key.ctrl && !key.meta) {
      if (input === "/") {
        setShowPopup(true)
      }
      if (input === "@" && value === "") {
        setValue("@file:")
        return
      }
      if (input === "$" && value === "") {
        setValue("$subagent:")
        return
      }
      if (input.length === 1) {
        setValue((v) => v + input)
        setSelectedIndex(0)
      }
    }
  })

  return (
    <Box flexDirection="column" marginTop={1} width={100}>
      {/* Slash command autocomplete popup menu */}
      {isSlashCommand && <SlashPopup filterText={value} selectedIndex={selectedIndex} />}

      {/* Main prompt input box */}
      <Box borderStyle="round" borderColor="cyan" flexDirection="column" paddingX={1} paddingY={0}>
        <Box gap={1}>
          <Text bold color="cyan">│</Text>
          <Text color={value ? "white" : "gray"}>
            {value || 'Type your message... (type / for commands)'}
            {disabled ? "" : "█"}
          </Text>
        </Box>
        <Box gap={1} marginTop={0}>
          <Text bold color="cyan">{activeMode}</Text>
          <Text color="gray">•</Text>
          <Text bold color="white">{modelName}</Text>
          <Text color="gray">•</Text>
          <Text color="gray">DDF Gateway</Text>
          <Text color="gray">•</Text>
          <Text bold color="yellow">high</Text>
        </Box>
      </Box>

      {/* Hotkey hint bar */}
      <Box gap={3} paddingX={1} marginTop={0}>
        <Box gap={1}>
          <Text bold color="black" backgroundColor="cyan"> tab </Text>
          <Text color="cyan">agents</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="black" backgroundColor="yellow"> ctrl+p </Text>
          <Text color="yellow">commands</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="magenta">@</Text>
          <Text color="magenta">attach file</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="green">$</Text>
          <Text color="green">subagent</Text>
        </Box>
        <Box gap={1}>
          <Text bold color="cyan">/</Text>
          <Text color="cyan">commands</Text>
        </Box>
      </Box>

      {/* Tip Banner Line */}
      <Box paddingX={1} marginTop={0} gap={1}>
        <Text color="yellow">● Tip</Text>
        <Text dimColor>Use</Text>
        <Text bold color="cyan">/capabilities</Text>
        <Text dimColor>to sync PDKs/skills or</Text>
        <Text bold color="cyan">/help</Text>
        <Text dimColor>for CLI reference</Text>
      </Box>
    </Box>
  )
}
