import { render } from "ink"
import React from "react"
import { App } from "./App.js"

export interface TuiOptions {
  apiKey: string
  email?: string
  tier?: string
  product?: string
}

export async function startTui(options: TuiOptions): Promise<void> {
  const { waitUntilExit } = render(
    React.createElement(App, {
      apiKey: options.apiKey,
      email: options.email,
      tier: options.tier,
      product: options.product || "LithoMind",
    }),
  )
  await waitUntilExit()
}
