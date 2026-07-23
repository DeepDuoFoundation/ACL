import { VscodeHostAdapter } from "./vscode-host-adapter.js";
export function activate(context) {
    const adapter = new VscodeHostAdapter(context);
    console.log("LithoMind AI extension activated");
    // Register commands, webview providers, etc.
}
export function deactivate() { }
//# sourceMappingURL=extension.js.map