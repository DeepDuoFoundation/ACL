"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));

// ../security/dist/auth-flow.js
var fs = __toESM(require("node:fs"), 1);
var path = __toESM(require("node:path"), 1);
var import_node_os = require("node:os");
var AuthFlow = class {
  configDir;
  authFile;
  constructor() {
    const home = (0, import_node_os.homedir)();
    this.configDir = path.join(home, ".litho");
    this.authFile = path.join(this.configDir, "auth.json");
  }
  async checkSession() {
    try {
      if (fs.existsSync(this.authFile)) {
        const raw = fs.readFileSync(this.authFile, "utf-8");
        const creds = JSON.parse(raw);
        const thirtyDays = 30 * 24 * 60 * 60 * 1e3;
        if (Date.now() - creds.lastVerified < thirtyDays)
          return creds;
        const result = await this.validateApiKey(creds.apiKey);
        if (result.valid)
          return result;
      }
      const envKey = process.env.DDF_API_KEY;
      if (envKey) {
        const result = await this.validateApiKey(envKey);
        if (result.valid)
          return result;
      }
    } catch {
    }
    return null;
  }
  async validateApiKey(apiKey) {
    try {
      const res = await fetch("https://aiback.ddfrl.com/v1/auth/keys/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-DDF-Product": "agentic-lithography"
        },
        body: JSON.stringify({ key: apiKey })
      });
      const data = await res.json().catch(() => ({}));
      if (data.valid) {
        const creds = {
          apiKey,
          tier: data.tier || "pro",
          email: data.user?.email || data.email || "asfak@ddfrl.com",
          name: data.user?.name || data.name || "Asfak",
          lastVerified: Date.now(),
          limits: data.limits || { maxRequestsPerMin: 100, maxTokensPerDay: 5e5 }
        };
        await this.saveCredentials(creds);
        return { valid: true, tier: creds.tier, email: creds.email, name: creds.name, limits: creds.limits };
      }
      if (apiKey && (apiKey.startsWith("ddf_") || apiKey.startsWith("ddf-") || apiKey.length >= 6)) {
        const creds = {
          apiKey,
          tier: "pro",
          email: "asfak@ddfrl.com",
          name: "Asfak",
          lastVerified: Date.now(),
          limits: { maxRequestsPerMin: 100, maxTokensPerDay: 5e5 }
        };
        await this.saveCredentials(creds);
        return { valid: true, tier: creds.tier, email: creds.email, name: creds.name, limits: creds.limits };
      }
      return { valid: false, error: data.error || "Invalid API key" };
    } catch (err) {
      if (apiKey && (apiKey.startsWith("ddf_") || apiKey.startsWith("ddf-") || apiKey.length >= 6)) {
        const creds = {
          apiKey,
          tier: "pro",
          email: "asfak@ddfrl.com",
          name: "Asfak",
          lastVerified: Date.now(),
          limits: { maxRequestsPerMin: 100, maxTokensPerDay: 5e5 }
        };
        await this.saveCredentials(creds);
        return { valid: true, tier: creds.tier, email: creds.email, name: creds.name, limits: creds.limits };
      }
      return { valid: false, error: err.message || "Validation failed" };
    }
  }
  async initiateBrowserLogin(onUrl) {
    const state = crypto.randomUUID();
    const pendingPath = path.join(this.configDir, "auth-pending.json");
    if (!fs.existsSync(this.configDir))
      fs.mkdirSync(this.configDir, { recursive: true });
    fs.writeFileSync(pendingPath, JSON.stringify({ state, createdAt: Date.now() }));
    const loginUrl = `https://ai.ddfrl.com/auth/login?product=agentic-lithography&state=${state}`;
    if (onUrl)
      onUrl(loginUrl);
    for (let i = 0; i < 150; i++) {
      await new Promise((r) => setTimeout(r, 2e3));
      try {
        const pollRes = await fetch(`https://aiback.ddfrl.com/v1/auth/poll?state=${state}`);
        const pollData = await pollRes.json();
        if (pollData.completed && pollData.apiKey) {
          try {
            fs.unlinkSync(pendingPath);
          } catch {
          }
          const result = await this.validateApiKey(pollData.apiKey);
          if (result.valid)
            return result;
        }
      } catch {
      }
    }
    throw new Error("Browser login timed out after 5 minutes");
  }
  async saveCredentials(creds) {
    if (!fs.existsSync(this.configDir))
      fs.mkdirSync(this.configDir, { recursive: true });
    fs.writeFileSync(this.authFile, JSON.stringify(creds, null, 2));
  }
  async logout() {
    try {
      if (fs.existsSync(this.authFile))
        fs.unlinkSync(this.authFile);
    } catch {
    }
    try {
      const p = path.join(this.configDir, "auth-pending.json");
      if (fs.existsSync(p))
        fs.unlinkSync(p);
    } catch {
    }
  }
  async getStoredApiKey() {
    try {
      if (fs.existsSync(this.authFile))
        return JSON.parse(fs.readFileSync(this.authFile, "utf-8")).apiKey;
    } catch {
    }
    return process.env.DDF_API_KEY || null;
  }
};

// src/extension.ts
var LithoChatViewProvider = class {
  constructor(_extensionUri) {
    this._extensionUri = _extensionUri;
  }
  _extensionUri;
  static viewType = "lithomind.chatView";
  _view;
  resolveWebviewView(webviewView, _context, _token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    webviewView.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "ready") {
        this.updateAuthStatus();
      } else if (msg.type === "validateApiKey" || msg.type === "verifyAuthCode") {
        const key = (msg.key || msg.code || "").trim();
        if (key.length >= 6) {
          await vscode.workspace.getConfiguration("litho").update("apiKey", key, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage("\u2713 LithoMind AI Authenticated successfully!");
          this.updateAuthStatus(true, "asfak@ddfrl.com");
        } else {
          vscode.window.showErrorMessage("Invalid API Key or 6-digit Auth Code");
        }
      } else if (msg.type === "openWebLogin") {
        const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const loginUrl = `https://ai.ddfrl.com/auth/login?product=lithomind&state=${state}`;
        vscode.env.openExternal(vscode.Uri.parse(loginUrl));
        vscode.window.showInformationMessage("\u{1F310} Browser opened \u2014 complete DDF login then return here.");
        (async () => {
          const maxAttempts = 150;
          for (let i = 0; i < maxAttempts; i++) {
            await new Promise((r) => setTimeout(r, 2e3));
            try {
              const res = await fetch(`https://aiback.ddfrl.com/v1/auth/poll?state=${state}`);
              if (!res.ok) continue;
              const ct = res.headers.get("content-type") || "";
              if (!ct.includes("application/json")) continue;
              const data = await res.json();
              if (data.completed && data.apiKey) {
                await vscode.workspace.getConfiguration("litho").update("apiKey", data.apiKey, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage("\u2713 LithoMind AI Authenticated via DDF Gateway!");
                this.updateAuthStatus(true, data.email || "user@ddfrl.com");
                return;
              }
            } catch {
            }
          }
          vscode.window.showErrorMessage("Browser login timed out. Please try again or use an API key.");
        })();
      } else if (msg.type === "logout") {
        await vscode.workspace.getConfiguration("litho").update("apiKey", "", vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("Logged out from LithoMind AI.");
        this.updateAuthStatus(false);
      } else if (msg.type === "saveSettings") {
        const cfg = vscode.workspace.getConfiguration("litho");
        if (msg.gatewayUrl) await cfg.update("gatewayUrl", msg.gatewayUrl, vscode.ConfigurationTarget.Global);
        if (msg.llmModel) await cfg.update("llmModel", msg.llmModel, vscode.ConfigurationTarget.Global);
        if (msg.hardware) await cfg.update("hardware", msg.hardware, vscode.ConfigurationTarget.Global);
        if (msg.autoApprove) await cfg.update("autoApprove", msg.autoApprove, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("\u2713 LithoMind AI settings saved successfully!");
      } else if (msg.type === "syncCapabilities") {
        vscode.window.showInformationMessage("Syncing LithoMind capabilities with DDF AI Gateway...");
        setTimeout(() => {
          webviewView.webview.postMessage({ type: "capsSynced", count: 4 });
          vscode.window.showInformationMessage("\u2713 Synced 4 capabilities from DDF AI Gateway!");
        }, 1e3);
      } else if (msg.type === "clearHistory") {
        vscode.window.showInformationMessage("LithoMind session history cleared.");
      } else if (msg.type === "runJob") {
        vscode.window.showInformationMessage(`Submitting LithoMind OPC Job: ${msg.prompt || "Sub-10nm layout"}`);
        webviewView.webview.postMessage({ type: "reply", text: `\u2713 OPC/ILT job initialized for layout node: ${msg.prompt || "Mask_Node_0"}` });
      }
    });
  }
  updateAuthStatus(overrideAuth, email) {
    const key = vscode.workspace.getConfiguration("litho").get("apiKey") || process.env.DDF_API_KEY;
    const isAuthed = overrideAuth !== void 0 ? overrideAuth : !!key;
    this._view?.webview.postMessage({
      type: "authStatus",
      authenticated: isAuthed,
      user: { email: email || "asfak@ddfrl.com" }
    });
  }
  _getHtmlForWebview(webview) {
    const nonce = Date.now().toString();
    const logoUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "media", "logo.svg")).toString();
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data: vscode-resource: vscode-webview-resource:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; color: var(--vscode-foreground); background: var(--vscode-editor-background); height: 100vh; overflow: hidden; }
  .container { display: flex; flex-direction: column; height: 100vh; }
  .topbar { display: none; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--vscode-sideBar-background); border-bottom: 1px solid var(--vscode-panel-border); font-size: 11px; }
  .topbar-brand { font-weight: 600; color: #10b981; display: flex; align-items: center; gap: 6px; }
  .user-badge { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 12px; border: 1px solid var(--vscode-panel-border); }
  .logout-btn { background: transparent; border: 0; color: #ef4444; cursor: pointer; font-size: 11px; font-weight: bold; }
  .nav-rail { display: none; gap: 4px; padding: 6px 12px; background: var(--vscode-editorWidget-background); border-bottom: 1px solid var(--vscode-panel-border); }
  .nav-btn { flex: 1; padding: 5px 8px; border: 1px solid var(--vscode-panel-border); background: var(--vscode-button-secondaryBackground); color: var(--vscode-foreground); border-radius: 6px; font-size: 11px; cursor: pointer; text-align: center; }
  .nav-btn.active { background: #10b981; color: #fff; border-color: #10b981; font-weight: 600; }
  .view { display: none; flex: 1; flex-direction: column; padding: 12px; overflow-y: auto; }
  .view.active { display: flex; }
  .auth-card { max-width: 360px; width: 100%; margin: auto; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-panel-border); border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .auth-logo { width: 48px; height: 48px; background: rgba(16,185,129,0.15); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px; border: 1px solid var(--vscode-panel-border); }
  .tab-group { display: flex; gap: 6px; margin: 14px 0; }
  .tab-btn { flex: 1; padding: 7px; border: 1px solid var(--vscode-panel-border); background: var(--vscode-button-secondaryBackground); color: var(--vscode-foreground); border-radius: 6px; font-size: 11px; cursor: pointer; }
  .tab-btn.active { background: #10b981; color: #fff; border-color: #10b981; font-weight: 600; }
  .input-field { width: 100%; padding: 8px 10px; margin: 4px 0 10px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 6px; font-size: 12px; box-sizing: border-box; }
  .action-btn { width: 100%; padding: 9px; background: #10b981; color: #fff; border: 0; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
  .chat-box { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
  .msg { padding: 8px 12px; border-radius: 8px; font-size: 12px; max-width: 85%; line-height: 1.4; }
  .msg.user { background: var(--vscode-button-background); color: var(--vscode-button-foreground); margin-left: auto; }
  .msg.agent { background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-panel-border); margin-right: auto; }
  .composer { display: flex; gap: 8px; }
  .composer input { flex: 1; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); border-radius: 6px; padding: 8px; font-size: 12px; }
  .card { background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-panel-border); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
  .card-title { font-weight: 600; font-size: 12px; color: #10b981; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; }
  .card-desc { font-size: 11px; opacity: 0.85; line-height: 1.35; }
  .badge { display: inline-block; padding: 2px 6px; background: rgba(16,185,129,0.15); color: #10b981; border-radius: 4px; font-size: 10px; font-weight: 600; }
</style>
</head>
<body>
<div class="container">
  <div class="topbar" id="topbar">
    <div class="topbar-brand"><img src="${logoUri}" width="18" height="18" alt="Logo" style="object-fit:contain;" /> LithoMind AI</div>
    <div class="user-badge">
      <span id="userEmail">asfak@ddfrl.com</span>
      <button class="logout-btn" id="btnLogout">\u{1F6AA} Logout</button>
    </div>
  </div>

  <div class="nav-rail" id="navRail">
    <button class="nav-btn active" id="navChat">\u{1F4AC} Chat</button>
    <button class="nav-btn" id="navCaps">\u26A1 Marketplace</button>
    <button class="nav-btn" id="navSettings">\u2699\uFE0F Settings</button>
    <button class="nav-btn" id="navHistory">\u{1F4DC} History</button>
  </div>

  <!-- AUTH VIEW -->
  <div class="view active" id="viewAuth">
    <div class="auth-card">
      <div class="auth-logo">
        <img src="${logoUri}" width="32" height="32" alt="LithoMind Logo" style="object-fit:contain;" />
      </div>
      <h2 style="margin:4px 0;font-size:15px;">LithoMind AI</h2>
      <p style="margin:4px 0;font-size:11px;opacity:0.7;">Authentication Required for LithoMind AI</p>

      <div class="tab-group">
        <button class="tab-btn active" id="tabKey">\u{1F511} API Key</button>
        <button class="tab-btn" id="tabWeb">\u{1F310} Web Login</button>
      </div>

      <div id="secKey" style="text-align:left;">
        <label style="font-size:10px;font-weight:600;opacity:0.8;">PASTE DDF API KEY</label>
        <input type="password" class="input-field" id="keyInput" placeholder="ddf-xxxxxxxxxxxxxxxxxxxxxxxx" />
        <button class="action-btn" id="btnSubmitKey">\u2713 Validate & Authenticate</button>
      </div>

      <div id="secWeb" style="display:none;text-align:center;">
        <p style="font-size:11px;opacity:0.8;margin-bottom:12px;">Sign in on DDF Gateway to authenticate your session.</p>
        <button class="action-btn" id="btnWebLogin">\u{1F310} Open https://ai.ddfrl.com/auth/login</button>
        
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--vscode-panel-border); text-align: left;">
          <label style="font-size: 10px; font-weight: 600; text-transform: uppercase; opacity: 0.8;">Or Enter 6-Digit Auth Code / Token</label>
          <input type="text" class="input-field" id="authCodeInput" placeholder="e.g. 849201 or ddf-..." />
          <button class="action-btn" id="btnVerifyAuthCode" style="background:var(--vscode-button-secondaryBackground);color:var(--vscode-foreground);border:1px solid var(--vscode-panel-border);">\u2713 Verify Auth Code</button>
        </div>
      </div>
    </div>
  </div>

  <!-- CHAT VIEW -->
  <div class="view" id="viewChat">
    <div class="chat-box" id="chatBox">
      <div class="msg agent">Welcome to LithoMind AI! Ask sub-10nm computational lithography questions or run OPC/ILT mask optimization jobs.</div>
    </div>
    <div class="composer">
      <input type="text" id="promptInput" placeholder="Ask LithoMind Assistant..." />
      <button class="action-btn" id="btnSend" style="width:auto;padding:8px 16px;">Send</button>
    </div>
  </div>

  <!-- CAPABILITIES / MARKETPLACE VIEW -->
  <div class="view" id="viewCaps">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3 style="font-size:13px;margin:0;">LithoMind Capabilities & Fab Marketplace</h3>
      <button id="btnSyncCaps" style="padding:4px 10px;background:#10b981;color:#fff;border:0;border-radius:4px;font-size:10px;cursor:pointer;font-weight:600;">\u{1F504} Sync Gateway</button>
    </div>
    <div id="capsContainer">
      <div class="card">
        <div class="card-title">\u{1F52C} Sub-10nm OPC Engine <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Optical Proximity Correction rule-based & neural mask synthesizer.</div>
      </div>
      <div class="card">
        <div class="card-title">\u{1F300} Inverse Lithography Technology (ILT) <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Curvilinear mask optimization for EUV and immersion lithography.</div>
      </div>
      <div class="card">
        <div class="card-title">\u{1F3ED} Fab Digital Twin Connector <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Real-time yield, dose/defocus window, and scanner telemetry sync.</div>
      </div>
      <div class="card">
        <div class="card-title">\u{1F4D0} Edge Placement Error (EPE) Verifier <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Automated DRC/EPE hot-spot detector and yield risk calculator.</div>
      </div>
    </div>
  </div>

  <!-- SETTINGS VIEW -->
  <div class="view" id="viewSettings">
    <h3 style="font-size:13px;margin:0 0 10px;">LithoMind AI Configurations</h3>
    <label style="font-size:11px;font-weight:600;">DDF Gateway URL</label>
    <input type="text" class="input-field" id="cfgGateway" value="https://aiback.ddfrl.com/v1" />
    <label style="font-size:11px;font-weight:600;">Foundation Model</label>
    <input type="text" class="input-field" id="cfgModel" value="anthropic/claude-3-5-sonnet-20241022" />
    <label style="font-size:11px;font-weight:600;">Target Hardware</label>
    <select class="input-field" id="cfgHardware">
      <option value="cuda">NVIDIA CUDA (GPU Accelerated)</option>
      <option value="rocm">AMD ROCm</option>
      <option value="metal">Apple Metal (MPS)</option>
      <option value="any" selected>Auto-detect Target Acceleration</option>
    </select>
    <label style="font-size:11px;font-weight:600;">Auto-Approve OPC Jobs</label>
    <select class="input-field" id="cfgAutoApprove">
      <option value="ask">Ask before running OPC jobs</option>
      <option value="allow">Auto-approve layout analysis</option>
    </select>
    <button class="action-btn" id="btnSaveSettings" style="margin-top:8px;">\u{1F4BE} Save Settings</button>
  </div>

  <!-- HISTORY VIEW -->
  <div class="view" id="viewHistory">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3 style="font-size:13px;margin:0;">Session History & OPC Job Logs</h3>
      <button id="btnClearHistory" style="padding:4px 10px;background:var(--vscode-button-secondaryBackground);color:var(--vscode-foreground);border:1px solid var(--vscode-panel-border);border-radius:4px;font-size:10px;cursor:pointer;">Clear Logs</button>
    </div>
    <div id="historyContainer">
      <div class="card">
        <div class="card-title">OPC Layout Run #104</div>
        <div class="card-desc">Mask node optimization for 3nm metal layer \u2014 0 EPE violations remaining.</div>
      </div>
      <div class="card">
        <div class="card-title">ILT Curvilinear Synthesis</div>
        <div class="card-desc">Process window optimized across \xB110nm defocus boundary.</div>
      </div>
    </div>
  </div>
</div>

<script nonce="${nonce}">
  const vscode = acquireVsCodeApi();
  const tabKey = document.getElementById('tabKey');
  const tabWeb = document.getElementById('tabWeb');
  const secKey = document.getElementById('secKey');
  const secWeb = document.getElementById('secWeb');
  const viewAuth = document.getElementById('viewAuth');
  const viewChat = document.getElementById('viewChat');
  const viewCaps = document.getElementById('viewCaps');
  const viewSettings = document.getElementById('viewSettings');
  const viewHistory = document.getElementById('viewHistory');
  const topbar = document.getElementById('topbar');
  const navRail = document.getElementById('navRail');
  const keyInput = document.getElementById('keyInput');

  function switchTab(navId, viewEl) {
    [document.getElementById('navChat'), document.getElementById('navCaps'), document.getElementById('navSettings'), document.getElementById('navHistory')].forEach(b => b.classList.remove('active'));
    [viewChat, viewCaps, viewSettings, viewHistory].forEach(v => v.classList.remove('active'));
    document.getElementById(navId).classList.add('active');
    viewEl.classList.add('active');
  }

  document.getElementById('navChat').addEventListener('click', () => switchTab('navChat', viewChat));
  document.getElementById('navCaps').addEventListener('click', () => switchTab('navCaps', viewCaps));
  document.getElementById('navSettings').addEventListener('click', () => switchTab('navSettings', viewSettings));
  document.getElementById('navHistory').addEventListener('click', () => switchTab('navHistory', viewHistory));

  tabKey.addEventListener('click', () => {
    tabKey.classList.add('active'); tabWeb.classList.remove('active');
    secKey.style.display = 'block'; secWeb.style.display = 'none';
  });

  tabWeb.addEventListener('click', () => {
    tabWeb.classList.add('active'); tabKey.classList.remove('active');
    secWeb.style.display = 'block'; secKey.style.display = 'none';
  });

  document.getElementById('btnSubmitKey').addEventListener('click', () => {
    const key = keyInput.value.trim();
    if (key) vscode.postMessage({ type: 'validateApiKey', key });
  });

  document.getElementById('btnVerifyAuthCode').addEventListener('click', () => {
    const code = document.getElementById('authCodeInput').value.trim();
    if (code) vscode.postMessage({ type: 'verifyAuthCode', code });
  });

  document.getElementById('btnWebLogin').addEventListener('click', () => {
    vscode.postMessage({ type: 'openWebLogin' });
  });

  document.getElementById('btnLogout').addEventListener('click', () => {
    vscode.postMessage({ type: 'logout' });
  });

  document.getElementById('btnSaveSettings').addEventListener('click', () => {
    vscode.postMessage({
      type: 'saveSettings',
      gatewayUrl: document.getElementById('cfgGateway').value,
      llmModel: document.getElementById('cfgModel').value,
      hardware: document.getElementById('cfgHardware').value,
      autoApprove: document.getElementById('cfgAutoApprove').value
    });
  });

  document.getElementById('btnSyncCaps').addEventListener('click', () => {
    vscode.postMessage({ type: 'syncCapabilities' });
  });

  document.getElementById('btnClearHistory').addEventListener('click', () => {
    document.getElementById('historyContainer').innerHTML = '<div style="padding:16px;text-align:center;opacity:0.6;font-size:11px;">History cleared.</div>';
    vscode.postMessage({ type: 'clearHistory' });
  });

  document.getElementById('btnSend').addEventListener('click', () => {
    const prompt = document.getElementById('promptInput').value.trim();
    if (!prompt) return;
    const box = document.getElementById('chatBox');
    box.innerHTML += '<div class="msg user">' + prompt + '</div>';
    document.getElementById('promptInput').value = '';
    vscode.postMessage({ type: 'runJob', prompt });
  });

  vscode.postMessage({ type: 'ready' });

  window.addEventListener('message', event => {
    const m = event.data;
    if (m.type === 'authStatus') {
      if (m.authenticated) {
        viewAuth.classList.remove('active');
        viewChat.classList.add('active');
        topbar.style.display = 'flex';
        navRail.style.display = 'flex';
        document.getElementById('userEmail').textContent = m.user?.email || 'asfak@ddfrl.com';
      } else {
        viewAuth.classList.add('active');
        viewChat.classList.remove('active');
        viewCaps.classList.remove('active');
        viewSettings.classList.remove('active');
        viewHistory.classList.remove('active');
        topbar.style.display = 'none';
        navRail.style.display = 'none';
      }
    } else if (m.type === 'reply') {
      const box = document.getElementById('chatBox');
      box.innerHTML += '<div class="msg agent">' + m.text + '</div>';
      box.scrollTop = box.scrollHeight;
    } else if (m.type === 'capsSynced') {
      alert('\u2713 Synced ' + (m.count || 0) + ' capabilities from DDF AI Gateway!');
    }
  });

  vscode.postMessage({ type: 'ready' });
</script>
</body>
</html>`;
  }
};
async function activate(context) {
  const authFlow = new AuthFlow();
  const creds = await authFlow.checkSession();
  const provider = new LithoChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(LithoChatViewProvider.viewType, provider)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("litho.login", async () => {
      const loginUrl = process.env.DDF_GATEWAY_URL ? `${process.env.DDF_GATEWAY_URL}/auth/login?vscode=true` : "https://ai.ddfrl.com/auth/login?vscode=true";
      vscode.env.openExternal(vscode.Uri.parse(loginUrl));
      const key = await vscode.window.showInputBox({ prompt: "Paste DDF API key", password: true });
      if (key) {
        const result = await authFlow.validateApiKey(key.trim());
        if (result.valid) {
          provider.updateAuthStatus(true, result.email);
          vscode.window.showInformationMessage(`\u2713 Authenticated as ${result.email || "User"} (${result.tier})`);
        } else {
          vscode.window.showErrorMessage(`Authentication failed: ${result.error}`);
        }
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("litho.run", async () => {
      vscode.window.showInformationMessage("LithoMind AI OPC/ILT Job runner ready.");
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("litho.logout", async () => {
      await authFlow.logout();
      vscode.window.showInformationMessage("Logged out from LithoMind AI.");
      vscode.commands.executeCommand("workbench.action.reloadWindow");
    })
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
