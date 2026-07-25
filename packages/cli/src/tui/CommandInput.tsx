import React, { useState } from "react"
import { Text, Box, useInput } from "ink"
import { SlashPopup, SLASH_COMMANDS, AVAILABLE_MODELS, AVAILABLE_AGENTS, AVAILABLE_CAPABILITIES } from "./SlashPopup.js"

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
  const cleanInput = value.trim().toLowerCase()
  const isModelsSubmenu = cleanInput === "/models" || cleanInput.startsWith("/models ")
  const isAgentsSubmenu = cleanInput === "/agents" || cleanInput.startsWith("/agents ")
  const isCapabilitiesSubmenu = cleanInput === "/capabilities" || cleanInput.startsWith("/capabilities ")

  let currentListLength = SLASH_COMMANDS.length
  if (isModelsSubmenu) currentListLength = AVAILABLE_MODELS.length
  else if (isAgentsSubmenu) currentListLength = AVAILABLE_AGENTS.length
  else if (isCapabilitiesSubmenu) currentListLength = AVAILABLE_CAPABILITIES.length
  else {
    const query = value.startsWith("/") ? value.slice(1).toLowerCase() : value.toLowerCase()
    const filtered = SLASH_COMMANDS.filter(
      (item) => item.cmd.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query),
    )
    currentListLength = filtered.length
  }

  useInput((input, key) => {
    if (disabled) return

    // Ctrl+P opens slash commands list
    if (key.ctrl && input.toLowerCase() === "p") {
      setShowPopup((prev) => !prev)
      if (!value.startsWith("/")) setValue("/")
      return
    }

    if (isSlashCommand && currentListLength > 0) {
      if (key.upArrow) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : currentListLength - 1))
        return
      }
      if (key.downArrow) {
        setSelectedIndex((prev) => (prev < currentListLength - 1 ? prev + 1 : 0))
        return
      }
      if (key.tab) {
        if (isModelsSubmenu) {
          const selected = AVAILABLE_MODELS[Math.min(selectedIndex, AVAILABLE_MODELS.length - 1)]
          if (selected) onSend(`/select_model ${selected.name}`)
        } else if (isAgentsSubmenu) {
          const selected = AVAILABLE_AGENTS[Math.min(selectedIndex, AVAILABLE_AGENTS.length - 1)]
          if (selected) onSend(`/select_agent ${selected.name}`)
        } else if (!isCapabilitiesSubmenu) {
          const query = value.startsWith("/") ? value.slice(1).toLowerCase() : value.toLowerCase()
          const filtered = SLASH_COMMANDS.filter(
            (item) => item.cmd.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query),
          )
          const selectedCmd = filtered[selectedIndex] || filtered[0]
          if (selectedCmd) {
            setValue(selectedCmd.cmd + " ")
            setShowPopup(false)
          }
        }
        return
      }
    }

    if (key.return) {
      const trimmed = value.trim()
      if (trimmed) {
        if (isModelsSubmenu) {
          const selected = AVAILABLE_MODELS[Math.min(selectedIndex, AVAILABLE_MODELS.length - 1)]
          if (selected) onSend(`/select_model ${selected.name}`)
          setValue("")
          setShowPopup(false)
          setSelectedIndex(0)
          return
        }
        if (isAgentsSubmenu) {
          const selected = AVAILABLE_AGENTS[Math.min(selectedIndex, AVAILABLE_AGENTS.length - 1)]
          if (selected) onSend(`/select_agent ${selected.name}`)
          setValue("")
          setShowPopup(false)
          setSelectedIndex(0)
          return
        }
        if (isSlashCommand && showPopup) {
          const query = value.startsWith("/") ? value.slice(1).toLowerCase() : value.toLowerCase()
          const filtered = SLASH_COMMANDS.filter(
            (item) => item.cmd.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query),
          )
          const selectedCmd = filtered[Math.min(selectedIndex, filtered.length - 1)]
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
