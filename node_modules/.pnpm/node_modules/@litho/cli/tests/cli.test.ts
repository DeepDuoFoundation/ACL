import { describe, it, expect } from "vitest";
import { CliHostAdapter } from "../src/cli-host-adapter.js";

describe("CliHostAdapter", () => {
  it("should show notification without error", () => {
    const adapter = new CliHostAdapter();
    expect(() => adapter.showNotification("test", "info")).not.toThrow();
  });
});
