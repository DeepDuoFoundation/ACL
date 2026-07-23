import type { HostAdapter } from "@litho/core";
import type { AgentResponse } from "@litho/shared";

export class JetBrainsHostAdapter implements HostAdapter {
  async readFile(path: string): Promise<string> {
    const fs = await import("node:fs/promises");
    return fs.readFile(path, "utf-8");
  }

  async writeFile(path: string, content: string): Promise<void> {
    const fs = await import("node:fs/promises");
    await fs.writeFile(path, content, "utf-8");
  }

  async showPrompt(message: string): Promise<string> {
    return message;
  }

  showNotification(message: string, level: "info" | "warn" | "error"): void {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }

  async openExternal(url: string): Promise<void> {
    console.log(`Opening: ${url}`);
  }

  streamOutput(chunk: AgentResponse): void {
    console.log(`[LithoMind] ${chunk.output.summary}`);
  }
}
