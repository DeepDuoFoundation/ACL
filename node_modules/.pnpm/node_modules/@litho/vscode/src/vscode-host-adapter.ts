import type { ExtensionContext } from "vscode";
import type { HostAdapter } from "@litho/core";
import type { AgentResponse } from "@litho/shared";

export class VscodeHostAdapter implements HostAdapter {
  constructor(private context: ExtensionContext) {}

  async readFile(path: string): Promise<string> {
    const fs = await import("node:fs/promises");
    return fs.readFile(path, "utf-8");
  }

  async writeFile(path: string, content: string): Promise<void> {
    const fs = await import("node:fs/promises");
    await fs.writeFile(path, content, "utf-8");
  }

  async showPrompt(message: string): Promise<string> {
    const { window } = await import("vscode");
    const result = await window.showInputBox({ prompt: message });
    return result ?? "";
  }

  showNotification(message: string, level: "info" | "warn" | "error"): void {
    import("vscode").then(({ window }) => {
      const fn = { info: window.showInformationMessage, warn: window.showWarningMessage, error: window.showErrorMessage }[level];
      fn(message);
    });
  }

  async openExternal(url: string): Promise<void> {
    const { env, Uri } = await import("vscode");
    await env.openExternal(Uri.parse(url));
  }

  streamOutput(chunk: AgentResponse): void {
    console.log(`[LithoMind] ${chunk.output.summary}`);
  }
}
