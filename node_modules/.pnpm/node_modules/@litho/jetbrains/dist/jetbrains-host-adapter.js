export class JetBrainsHostAdapter {
    async readFile(path) {
        const fs = await import("node:fs/promises");
        return fs.readFile(path, "utf-8");
    }
    async writeFile(path, content) {
        const fs = await import("node:fs/promises");
        await fs.writeFile(path, content, "utf-8");
    }
    async showPrompt(message) {
        return message;
    }
    showNotification(message, level) {
        console.log(`[${level.toUpperCase()}] ${message}`);
    }
    async openExternal(url) {
        console.log(`Opening: ${url}`);
    }
    streamOutput(chunk) {
        console.log(`[LithoMind] ${chunk.output.summary}`);
    }
}
//# sourceMappingURL=jetbrains-host-adapter.js.map