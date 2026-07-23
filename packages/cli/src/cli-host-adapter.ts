import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import type { HostAdapter } from "@litho/core";
import type { AgentResponse } from "@litho/shared";

export class CliHostAdapter implements HostAdapter {
  async readFile(path: string): Promise<string> {
    return readFile(path, "utf-8");
  }

  async writeFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, "utf-8");
  }

  async showPrompt(message: string): Promise<string> {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
      rl.question(message + " ", (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  showNotification(message: string, level: "info" | "warn" | "error"): void {
    const prefix = { info: "ℹ", warn: "⚠", error: "✖" }[level];
    console.log(`${prefix} ${message}`);
  }

  async openExternal(url: string): Promise<void> {
    console.log(`Opening: ${url}`);
  }

  streamOutput(chunk: AgentResponse): void {
    console.log(`[${chunk.agentId}] ${chunk.output.summary}`);
  }
}
