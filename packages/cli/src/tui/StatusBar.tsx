import React from "react"
import { Text, Box } from "ink"

interface StatusBarProps {
  email?: string
  tier?: string
  product: string
  version?: string
}

export function StatusBar({ email, tier, product, version = "0.1.0" }: StatusBarProps) {
  const statusText = email ? email : "Not authenticated"
  const tierBadge = tier ? (tier === "pro" ? "PRO" : tier === "enterprise" ? "ENT" : "FREE") : "PRO"
  const tierColor = tier === "pro" ? "green" : tier === "enterprise" ? "magenta" : "yellow"

  return (
    <Box borderStyle="single" borderColor="gray" paddingX={1} justifyContent="space-between">
      <Box gap={2}>
        <Text bold color="cyan">{`~\\${product}:master`}</Text>
        <Text color="green">●</Text>
        <Text bold color="green">4 MCPs</Text>
        <Text color="gray">/status</Text>
        <Text color="gray">│</Text>
        <Text>{statusText}</Text>
        <Text bold color={tierColor}>{`[${tierBadge}]`}</Text>
      </Box>
      <Box>
        <Text dimColor>{`v${version}`}</Text>
      </Box>
    </Box>
  )
}
