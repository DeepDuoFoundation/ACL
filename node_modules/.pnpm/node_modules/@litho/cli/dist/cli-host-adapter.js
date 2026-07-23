import { readFile, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
export class CliHostAdapter {
    async readFile(path) {
        return readFile(path, "utf-8");
    }
    async writeFile(path, content) {
        await writeFile(path, content, "utf-8");
    }
    async showPrompt(message) {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        return new Promise((resolve) => {
            rl.question(message + " ", (answer) => {
                rl.close();
                resolve(answer);
            });
        });
    }
    showNotification(message, level) {
        const prefix = { info: "ℹ", warn: "⚠", error: "✖" }[level];
        console.log(`${prefix} ${message}`);
    }
    async openExternal(url) {
        console.log(`Opening: ${url}`);
    }
    streamOutput(chunk) {
        console.log(`[${chunk.agentId}] ${chunk.output.summary}`);
    }
}
//# sourceMappingURL=cli-host-adapter.js.map