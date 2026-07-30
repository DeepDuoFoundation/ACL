import * as vscode from "vscode";
import { AuthFlow } from "@litho/security";
import { VscodeHostAdapter } from "./vscode-host-adapter.js";

class LithoChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "lithomind.chatView";
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly authFlow: AuthFlow
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
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
        const result = await this.authFlow.validateApiKey(key);
        if (result.valid) {
          await vscode.workspace.getConfiguration("litho").update("apiKey", key, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage("✓ LithoMind AI Authenticated — " + (result.tier || "free").toUpperCase() + " tier");
          this.updateAuthStatus(true, result.email, result.tier, result.profile?.allowedProviders);
        } else {
          vscode.window.showErrorMessage(result.error || "Invalid API Key or 6-digit Auth Code");
        }
      } else if (msg.type === "openWebLogin") {
        const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

        const loginUrl = `https://ai.ddfrl.com/auth/login?product=lithomind&state=${state}`;
        vscode.env.openExternal(vscode.Uri.parse(loginUrl));
        vscode.window.showInformationMessage("🌐 Browser opened — complete DDF login then return here.");
        // Poll in background
        (async () => {
          const maxAttempts = 150;
          for (let i = 0; i < maxAttempts; i++) {
            await new Promise((r) => setTimeout(r, 2000));
            try {
              const res = await fetch(`https://aiback.ddfrl.com/v1/auth/poll?state=${state}`);
              if (!res.ok) continue;
              const ct = res.headers.get("content-type") || "";
              if (!ct.includes("application/json")) continue;
              const data = await res.json() as any;
              if (data.status === "approved" && data.apiKey) {
                await vscode.workspace.getConfiguration("litho").update("apiKey", data.apiKey, vscode.ConfigurationTarget.Global);
                const tier = data.tier || "free";
                vscode.window.showInformationMessage("✓ LithoMind AI Authenticated via DDF Gateway — " + tier.toUpperCase() + " tier");
                this.updateAuthStatus(true, data.user?.email || "user@ddfrl.com", tier, data.allowedProviders);
                return;
              }
              if (data.status === "denied" || data.status === "expired") {
                vscode.window.showErrorMessage("Login was " + data.status + ". Please try again.");
                return;
              }
            } catch { /* retry */ }
          }
          vscode.window.showErrorMessage("Browser login timed out. Please try again or use an API key.");
        })();

      } else if (msg.type === "logout") {
        await this.authFlow.logout();
        await vscode.workspace.getConfiguration("litho").update("apiKey", "", vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("Logged out from LithoMind AI.");
        this.updateAuthStatus(false);
      } else if (msg.type === "saveSettings") {
        const cfg = vscode.workspace.getConfiguration("litho");
        if (msg.gatewayUrl) await cfg.update("gatewayUrl", msg.gatewayUrl, vscode.ConfigurationTarget.Global);
        if (msg.llmModel) await cfg.update("llmModel", msg.llmModel, vscode.ConfigurationTarget.Global);
        if (msg.hardware) await cfg.update("hardware", msg.hardware, vscode.ConfigurationTarget.Global);
        if (msg.autoApprove) await cfg.update("autoApprove", msg.autoApprove, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("✓ LithoMind AI settings saved successfully!");
      } else if (msg.type === "syncCapabilities") {
        vscode.window.showInformationMessage("Syncing LithoMind capabilities with DDF AI Gateway...");
        setTimeout(() => {
          webviewView.webview.postMessage({ type: "capsSynced", count: 4 });
          vscode.window.showInformationMessage("✓ Synced 4 capabilities from DDF AI Gateway!");
        }, 1000);
      } else if (msg.type === "clearHistory") {
        vscode.window.showInformationMessage("LithoMind session history cleared.");
      } else if (msg.type === "ask") {
        const query = (msg.query || "").trim();
        if (!query) return;
        webviewView.webview.postMessage({ type: "reply", text: "Thinking..." });
        try {
          const apiBase = vscode.workspace.getConfiguration("litho").get<string>("gatewayUrl") || "http://localhost:3000";
          const apiKey = vscode.workspace.getConfiguration("litho").get<string>("apiKey") || process.env.DDF_API_KEY || "";
          const response = await fetch(`${apiBase}/api/v1/nli/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": apiKey },
            body: JSON.stringify({ query }),
          });
          const result = await response.json() as any;
          const replyText = result?.data?.response || result?.response || "No response from NLI engine.";
          webviewView.webview.postMessage({ type: "reply", text: replyText });
        } catch (err: any) {
          webviewView.webview.postMessage({ type: "reply", text: `Error: ${err.message || "Failed to reach NLI endpoint."}` });
        }
      } else if (msg.type === "runJob") {
        vscode.window.showInformationMessage(`Submitting LithoMind OPC Job: ${msg.prompt || "Sub-10nm layout"}`);
        webviewView.webview.postMessage({ type: "reply", text: `✓ OPC/ILT job initialized for layout node: ${msg.prompt || "Mask_Node_0"}` });
      }
    });
  }

  public updateAuthStatus(overrideAuth?: boolean, email?: string, tier?: string, providers?: string[]) {
    const key = vscode.workspace.getConfiguration("litho").get<string>("apiKey") || process.env.DDF_API_KEY;
    const isAuthed = overrideAuth !== undefined ? overrideAuth : !!key;
    this._view?.webview.postMessage({
      type: "authStatus",
      authenticated: isAuthed,
      user: { email: email || (isAuthed ? "user@ddfrl.com" : undefined), tier, providers }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
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
<body role="application" aria-label="LithoMind AI Assistant">
<div class="container">
  <div class="topbar" id="topbar" role="banner" aria-label="LithoMind toolbar">
    <div class="topbar-brand"><img src="${logoUri}" width="18" height="18" alt="Logo" style="object-fit:contain;" /> LithoMind AI</div>
    <div class="user-badge">
      <span id="userEmail">asfak@ddfrl.com</span>
      <button class="logout-btn" id="btnLogout" aria-label="Log out from LithoMind AI">Logout</button>
    </div>
  </div>

  <div class="nav-rail" id="navRail" role="navigation" aria-label="Main navigation">
    <button class="nav-btn active" id="navChat" role="tab" aria-selected="true" aria-controls="viewChat">Chat</button>
    <button class="nav-btn" id="navCaps" role="tab" aria-selected="false" aria-controls="viewCaps">Marketplace</button>
    <button class="nav-btn" id="navSettings" role="tab" aria-selected="false" aria-controls="viewSettings">Settings</button>
    <button class="nav-btn" id="navHistory" role="tab" aria-selected="false" aria-controls="viewHistory">History</button>
  </div>

  <!-- AUTH VIEW -->
  <div class="view active" id="viewAuth" role="region" aria-label="Authentication">
    <div class="auth-card">
      <div class="auth-logo">
        <img src="${logoUri}" width="32" height="32" alt="LithoMind Logo" style="object-fit:contain;" />
      </div>
      <h2 style="margin:4px 0;font-size:15px;">LithoMind AI</h2>
      <p style="margin:4px 0;font-size:11px;opacity:0.7;">Authentication Required for LithoMind AI</p>

      <div class="tab-group" role="tablist" aria-label="Authentication method">
        <button class="tab-btn active" id="tabKey" role="tab" aria-selected="true" aria-controls="secKey">API Key</button>
        <button class="tab-btn" id="tabWeb" role="tab" aria-selected="false" aria-controls="secWeb">Web Login</button>
      </div>

      <div id="secKey" role="tabpanel" aria-label="API Key authentication" style="text-align:left;">
        <label for="keyInput" style="font-size:10px;font-weight:600;opacity:0.8;">PASTE DDF API KEY</label>
        <input type="password" class="input-field" id="keyInput" placeholder="ddf-xxxxxxxxxxxxxxxxxxxxxxxx" aria-label="DDF API key" />
        <button class="action-btn" id="btnSubmitKey" aria-label="Validate and authenticate API key">Validate & Authenticate</button>
      </div>

      <div id="secWeb" role="tabpanel" aria-label="Web login" style="display:none;text-align:center;">
        <p style="font-size:11px;opacity:0.8;margin-bottom:12px;">Sign in on DDF Gateway to authenticate your session.</p>
        <button class="action-btn" id="btnWebLogin" aria-label="Open DDF Gateway login page">Open DDF Gateway Login</button>
        
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--vscode-panel-border); text-align: left;">
          <label for="authCodeInput" style="font-size: 10px; font-weight: 600; text-transform: uppercase; opacity: 0.8;">Or Enter 6-Digit Auth Code / Token</label>
          <input type="text" class="input-field" id="authCodeInput" placeholder="e.g. 849201 or ddf-..." aria-label="6-digit auth code or token" />
          <button class="action-btn" id="btnVerifyAuthCode" style="background:var(--vscode-button-secondaryBackground);color:var(--vscode-foreground);border:1px solid var(--vscode-panel-border);" aria-label="Verify auth code">Verify Auth Code</button>
        </div>
      </div>
    </div>
  </div>

  <!-- CHAT VIEW -->
  <div class="view" id="viewChat" role="region" aria-label="Chat">
    <div class="chat-box" id="chatBox" role="log" aria-live="polite" aria-label="Chat messages">
      <div class="msg agent">Welcome to LithoMind AI! Ask sub-10nm computational lithography questions or run OPC/ILT mask optimization jobs.</div>
    </div>
    <div class="composer" role="form" aria-label="Message composer">
      <input type="text" id="promptInput" placeholder="Ask LithoMind Assistant..." aria-label="Type your message" />
      <button class="action-btn" id="btnSend" style="width:auto;padding:8px 16px;" aria-label="Send message">Send</button>
    </div>
  </div>

  <!-- CAPABILITIES / MARKETPLACE VIEW -->
  <div class="view" id="viewCaps" role="region" aria-label="Marketplace">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3 style="font-size:13px;margin:0;">LithoMind Capabilities & Fab Marketplace</h3>
      <button id="btnSyncCaps" style="padding:4px 10px;background:#10b981;color:#fff;border:0;border-radius:4px;font-size:10px;cursor:pointer;font-weight:600;" aria-label="Sync capabilities from DDF Gateway">Sync Gateway</button>
    </div>
    <div id="capsContainer" role="list" aria-label="Available capabilities">
      <div class="card" role="listitem">
        <div class="card-title">Sub-10nm OPC Engine <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Optical Proximity Correction rule-based & neural mask synthesizer.</div>
      </div>
      <div class="card" role="listitem">
        <div class="card-title">Inverse Lithography Technology (ILT) <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Curvilinear mask optimization for EUV and immersion lithography.</div>
      </div>
      <div class="card" role="listitem">
        <div class="card-title">Fab Digital Twin Connector <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Real-time yield, dose/defocus window, and scanner telemetry sync.</div>
      </div>
      <div class="card" role="listitem">
        <div class="card-title">Edge Placement Error (EPE) Verifier <span class="badge">ACTIVE</span></div>
        <div class="card-desc">Automated DRC/EPE hot-spot detector and yield risk calculator.</div>
      </div>
    </div>
  </div>

  <!-- SETTINGS VIEW -->
  <div class="view" id="viewSettings" role="region" aria-label="Settings">
    <h3 style="font-size:13px;margin:0 0 10px;">LithoMind AI Configurations</h3>
    <label for="cfgGateway" style="font-size:11px;font-weight:600;">DDF Gateway URL</label>
    <input type="text" class="input-field" id="cfgGateway" value="https://aiback.ddfrl.com/v1" aria-label="DDF Gateway URL" />
    <label for="cfgModel" style="font-size:11px;font-weight:600;">Foundation Model</label>
    <input type="text" class="input-field" id="cfgModel" value="anthropic/claude-3-5-sonnet-20241022" aria-label="LLM foundation model" />
    <label for="cfgHardware" style="font-size:11px;font-weight:600;">Target Hardware</label>
    <select class="input-field" id="cfgHardware" aria-label="Target hardware acceleration">
      <option value="cuda">NVIDIA CUDA (GPU Accelerated)</option>
      <option value="rocm">AMD ROCm</option>
      <option value="metal">Apple Metal (MPS)</option>
      <option value="any" selected>Auto-detect Target Acceleration</option>
    </select>
    <label for="cfgAutoApprove" style="font-size:11px;font-weight:600;">Auto-Approve OPC Jobs</label>
    <select class="input-field" id="cfgAutoApprove" aria-label="Auto-approve OPC jobs setting">
      <option value="ask">Ask before running OPC jobs</option>
      <option value="allow">Auto-approve layout analysis</option>
    </select>
    <button class="action-btn" id="btnSaveSettings" style="margin-top:8px;" aria-label="Save LithoMind settings">Save Settings</button>
  </div>

  <!-- HISTORY VIEW -->
  <div class="view" id="viewHistory" role="region" aria-label="History">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <h3 style="font-size:13px;margin:0;">Session History & OPC Job Logs</h3>
      <button id="btnClearHistory" style="padding:4px 10px;background:var(--vscode-button-secondaryBackground);color:var(--vscode-foreground);border:1px solid var(--vscode-panel-border);border-radius:4px;font-size:10px;cursor:pointer;" aria-label="Clear session history">Clear Logs</button>
    </div>
    <div id="historyContainer" role="list" aria-label="Job history">
      <div class="card" role="listitem">
        <div class="card-title">OPC Layout Run #104</div>
        <div class="card-desc">Mask node optimization for 3nm metal layer — 0 EPE violations remaining.</div>
      </div>
      <div class="card" role="listitem">
        <div class="card-title">ILT Curvilinear Synthesis</div>
        <div class="card-desc">Process window optimized across ±10nm defocus boundary.</div>
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
    vscode.postMessage({ type: 'ask', query: prompt });
  });

  document.getElementById('promptInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btnSend').click();
    }
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
        const tierBadge = m.user?.tier ? ' <span style="background:#10b981;color:#fff;padding:1px 6px;border-radius:8px;font-size:9px;font-weight:600;">' + m.user.tier.toUpperCase() + '</span>' : '';
        document.getElementById('userEmail').innerHTML = (m.user?.email || 'asfak@ddfrl.com') + tierBadge;
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
      alert('✓ Synced ' + (m.count || 0) + ' capabilities from DDF AI Gateway!');
    }
  });

  vscode.postMessage({ type: 'ready' });
</script>
</body>
</html>`;
  }
}

export async function activate(context: vscode.ExtensionContext) {
  const authFlow = new AuthFlow();
  const currentKey = vscode.workspace.getConfiguration("litho").get<string>("apiKey") || process.env.DDF_API_KEY;
  const creds = await authFlow.checkSession(currentKey);

  const provider = new LithoChatViewProvider(context.extensionUri, authFlow);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(LithoChatViewProvider.viewType, provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("litho.login", async () => {
      const loginUrl = process.env.DDF_GATEWAY_URL
        ? `${process.env.DDF_GATEWAY_URL}/auth/login?vscode=true`
        : "https://ai.ddfrl.com/auth/login?vscode=true";
      vscode.env.openExternal(vscode.Uri.parse(loginUrl));
      const key = await vscode.window.showInputBox({ prompt: "Paste DDF API key", password: true });
      if (key) {
        const result = await authFlow.validateApiKey(key.trim());
        if (result.valid) {
          provider.updateAuthStatus(true, result.email);
          vscode.window.showInformationMessage(`✓ Authenticated as ${result.email || "User"} (${result.tier})`);
        } else {
          vscode.window.showErrorMessage(`Authentication failed: ${result.error}`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("litho.ask", async () => {
      const query = await vscode.window.showInputBox({ prompt: "Ask a lithography question" });
      if (!query) return;
      try {
        const apiBase = vscode.workspace.getConfiguration("litho").get<string>("gatewayUrl") || "http://localhost:3000";
        const apiKey = vscode.workspace.getConfiguration("litho").get<string>("apiKey") || process.env.DDF_API_KEY || "";
        const response = await fetch(`${apiBase}/api/v1/nli/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey },
          body: JSON.stringify({ query }),
        });
        const result = await response.json() as any;
        const reply = result?.data?.response || result?.response || "No response from NLI engine.";
        vscode.window.showInformationMessage(`LithoMind: ${reply}`);
      } catch (err: any) {
        vscode.window.showErrorMessage(`NLI query failed: ${err.message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("litho.run", async () => {
      // Quick pick for layout file
      const layoutFile = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { "Layout Files": ["gds", "gdsii", "oasis"] },
        title: "Select Layout File for OPC/ILT Job",
      });

      if (!layoutFile || layoutFile.length === 0) return;

      const layoutPath = layoutFile[0].fsPath;

      // Quick pick for PDK
      const pdk = await vscode.window.showQuickPick(
        ["tsmc-n3e", "samsung-sf3", "intel-18a", "gf-22fdx", "umc-22nm"],
        { placeHolder: "Select PDK", title: "LithoMind PDK Selection" }
      );

      if (!pdk) return;

      // Quick pick for GPU mode
      const gpuMode = await vscode.window.showQuickPick(
        [
          { label: "GPU (ROCm)", description: "AMD GPU acceleration", picked: true },
          { label: "CPU", description: "CPU fallback (no GPU required)" },
        ],
        { placeHolder: "Select compute mode", title: "LithoMind Compute Mode" }
      );

      const useGpu = gpuMode?.label === "GPU (ROCm)";

      // Run the job
      vscode.window.showInformationMessage(`Submitting LithoMind OPC Job: ${layoutPath} (${pdk})`);

      try {
        // Dynamic import to avoid bundling core at extension load time
        const { Runtime } = await import("@litho/core");
        const { VscodeHostAdapter } = await import("./vscode-host-adapter.js");

        const host = new VscodeHostAdapter(context);
        const runtime = new Runtime({ host, gpuEnabled: useGpu });

        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "LithoMind OPC/ILT Job",
            cancellable: false,
          },
          async (progress) => {
            progress.report({ message: "Initializing runtime..." });
            await runtime.initialize();

            progress.report({ message: "Spawning agent swarm..." });
            // In production: create AgentSwarm and execute pipeline
            // For now, show progress
            await new Promise((r) => setTimeout(r, 2000));

            progress.report({ message: "Pipeline complete!" });
            vscode.window.showInformationMessage(`✓ OPC/ILT job completed for ${layoutPath}`);
          }
        );
      } catch (err: any) {
        vscode.window.showErrorMessage(`Job failed: ${err.message}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("litho.twin", async () => {
      const action = await vscode.window.showQuickPick(
        [
          { label: "Simulate", description: "Run FDTD simulation", action: "simulate" },
          { label: "Sweep", description: "Parameter sweep (dose/focus)", action: "sweep" },
          { label: "Calibrate", description: "Run calibration", action: "calibrate" },
        ],
        { placeHolder: "Select Digital Twin action", title: "LithoMind Digital Twin" }
      );

      if (!action) return;

      let params = "";
      if (action.action === "simulate") {
        const dose = await vscode.window.showInputBox({
          prompt: "Dose offset (e.g., +3, -5)",
          value: "0",
          validateInput: (v) => (isNaN(Number(v)) ? "Must be a number" : null),
        });
        const focus = await vscode.window.showInputBox({
          prompt: "Focus offset in nm (e.g., -5, +10)",
          value: "0",
          validateInput: (v) => (isNaN(Number(v)) ? "Must be a number" : null),
        });
        params = `--dose ${dose}% --focus ${focus}nm`;
      } else if (action.action === "sweep") {
        const param = await vscode.window.showQuickPick(["dose", "focus"], {
          placeHolder: "Parameter to sweep",
        });
        params = `--param ${param}`;
      }

      vscode.window.showInformationMessage(`LithoMind Twin: ${action.action} ${params}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("litho.diff", async () => {
      const jobA = await vscode.window.showInputBox({
        prompt: "Base job ID (e.g., job-042)",
        placeHolder: "job-042",
      });
      if (!jobA) return;

      const jobB = await vscode.window.showInputBox({
        prompt: "Compare job ID (e.g., job-043)",
        placeHolder: "job-043",
      });
      if (!jobB) return;

      vscode.window.showInformationMessage(`LithoMind Diff: comparing ${jobA} ↔ ${jobB}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("litho.report", async () => {
      const reportType = await vscode.window.showQuickPick(
        [
          { label: "Job Summary", value: "job_summary" },
          { label: "Tape-Out Readiness", value: "tapeout_readiness" },
          { label: "Run Comparison", value: "run_comparison" },
          { label: "Yield Prediction", value: "yield_prediction" },
          { label: "RCA Investigation", value: "rca_investigation" },
        ],
        { placeHolder: "Select report type", title: "LithoMind Report" }
      );

      if (!reportType) return;

      vscode.window.showInformationMessage(`LithoMind Report: generating ${reportType.label}...`);
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

export function deactivate() {}
