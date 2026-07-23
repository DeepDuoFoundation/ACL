import type { AgentResponse } from "@litho/shared";

export interface HostAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  showPrompt(message: string): Promise<string>;
  showNotification(message: string, level: "info" | "warn" | "error"): void;
  openExternal(url: string): Promise<void>;
  streamOutput(chunk: AgentResponse): void;
}
