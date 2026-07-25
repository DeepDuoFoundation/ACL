import React, { useState, useEffect } from "react"
import { Box, Text } from "ink"

const ASCII_LITHO = `
  ██╗     ██╗████████╗██╗  ██╗██████╗ ███╗   ███╗██╗███╗   ██╗██████╗ 
  ██║     ██║╚══██╔══╝██║  ██║██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗
  ██║     ██║   ██║   ███████║██║  ██║██╔████╔██║██║██╔██╗ ██║██║  ██║
  ██║     ██║   ██║   ██╔══██║██║  ██║██║╚██╔╝██║██║██║╚██╗██║██║  ██║
  ███████╗██║   ██║   ██║  ██║██████╔╝██║ ╚═╝ ██║██║██║ ╚████║██████╔╝
  ╚══════╝╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═════╝ 
`

const COLORS: ("cyan" | "green" | "yellow" | "magenta" | "blue")[] = ["cyan", "green", "yellow", "magenta", "blue"]

export function HeaderBanner({ title = "LITHOMIND AI", subtitle = "Agentic Computational Lithography Platform" }) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((f) => f + 1)
    }, 300)
    return () => clearInterval(timer)
  }, [])

  const c1 = COLORS[frame % COLORS.length]
  const c2 = COLORS[(frame + 1) % COLORS.length]
  const c3 = COLORS[(frame + 2) % COLORS.length]
  const c4 = COLORS[(frame + 3) % COLORS.length]

  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Box justifyContent="space-between" width={70}>
        <Text color={c1}>✧</Text>
        <Text color={c2}>✦</Text>
        <Text color={c3}>★</Text>
        <Text color={c4}>✦</Text>
        <Text color={c1}>✧</Text>
      </Box>
      <Text bold color={c1}>
        {ASCII_LITHO}
      </Text>
      <Box gap={2} marginTop={0}>
        <Text color={c2}>✧</Text>
        <Text bold color={c3}>
          {title}
        </Text>
        <Text color="gray">•</Text>
        <Text color={c4}>{subtitle}</Text>
        <Text color={c1}>✦</Text>
      </Box>
    </Box>
  )
}
