import React from "react"
import { Text, Box } from "ink"

interface StatusBarProps {
  email?: string
  tier?: string
  product: string
  version?: string
}

export function StatusBar({ email = "asfak@ddfrl.com", tier = "pro", product = "LithoMind AI", version = "0.1.0" }: StatusBarProps) {
  const statusText = email ? `Authenticated as ${email}` : "Not authenticated"
  const tierBadge = tier ? (tier === "pro" ? "PRO" : tier === "enterprise" ? "ENT" : "FREE") : "PRO"
  const tierColor = tier === "pro" ? "green" : tier === "enterprise" ? "magenta" : "yellow"

  return (
    <Box borderStyle="single" borderColor="cyan" paddingX={1} justifyContent="space-between" width={100}>
      <Box gap={2}>
        <Text bold color="cyan">{product}</Text>
        <Text color="gray">│</Text>
        <Text color="white">{statusText}</Text>
        <Text bold color={tierColor}>{`[${tierBadge}]`}</Text>
      </Box>
      <Box gap={2}>
        <Text color="gray">│</Text>
        <Text dimColor>Ctrl+C to exit</Text>
        <Text color="gray">│</Text>
        <Text dimColor>{`v${version}`}</Text>
      </Box>
    </Box>
  )
}
