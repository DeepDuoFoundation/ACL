"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VscodeHostAdapter = void 0;
class VscodeHostAdapter {
    context;
    constructor(context) {
        this.context = context;
    }
    async readFile(path) {
        const fs = await import("node:fs/promises");
        return fs.readFile(path, "utf-8");
    }
    async writeFile(path, content) {
        const fs = await import("node:fs/promises");
        await fs.writeFile(path, content, "utf-8");
    }
    async showPrompt(message) {
        const { window } = await import("vscode");
        const result = await window.showInputBox({ prompt: message });
        return result ?? "";
    }
    showNotification(message, level) {
        import("vscode").then(({ window }) => {
            const fn = { info: window.showInformationMessage, warn: window.showWarningMessage, error: window.showErrorMessage }[level];
            fn(message);
        });
    }
    async openExternal(url) {
        const { env, Uri } = await import("vscode");
        await env.openExternal(Uri.parse(url));
    }
    streamOutput(chunk) {
        console.log(`[LithoMind] ${chunk.output.summary}`);
    }
}
exports.VscodeHostAdapter = VscodeHostAdapter;
//# sourceMappingURL=vscode-host-adapter.js.map