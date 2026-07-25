import React from "react"
import { Box, Text } from "ink"

const ASCII_LITHO = `
  ██╗     ██╗████████╗██╗  ██╗██████╗ ███╗   ███╗██╗███╗   ██╗██████╗ 
  ██║     ██║╚══██╔══╝██║  ██║██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗
  ██║     ██║   ██║   ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║██║  ██║
  ██║     ██║   ██║   ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║██║  ██║
  ███████╗██║   ██║   ██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██████╔╝
  ╚══════╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ 
`

export function HeaderBanner({ title = "LITHOMIND AI", subtitle = "Agentic Computational Lithography Platform" }) {
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Box justifyContent="space-between" width={70}>
        <Text color="yellow">✧</Text>
        <Text color="cyan">✦</Text>
        <Text color="magenta">★</Text>
        <Text color="yellow">✦</Text>
      </Box>
      <Text bold color="cyan">
        {ASCII_LITHO}
      </Text>
      <Box gap={2} marginTop={0}>
        <Text dimColor>✧</Text>
        <Text bold color="green">
          {title}
        </Text>
        <Text color="gray">•</Text>
        <Text color="cyan">{subtitle}</Text>
        <Text dimColor>✦</Text>
      </Box>
    </Box>
  )
}
