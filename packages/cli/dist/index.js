#!/usr/bin/env node
import { Command } from "commander";
import { AuthFlow } from "@litho/security";
import { runCommand } from "./commands/run.js";
import { askCommand } from "./commands/ask.js";
import { twinCommand } from "./commands/twin.js";
import { reportCommand } from "./commands/report.js";
import { diffCommand } from "./commands/diff.js";
import { authCommand } from "./commands/auth.js";
import { capabilitiesCommand } from "./commands/capabilities.js";
import * as readline from "node:readline";
const program = new Command();
program
    .name("litho")
    .description("LithoMind AI — Agentic Computational Lithography Platform")
    .version("0.1.0");
program.command("run").description("Run an OPC/ILT correction job").action(runCommand);
program.command("ask").description("Ask a natural language question").argument("<query>").action(askCommand);
program.command("twin").description("Digital Twin simulation commands").action(twinCommand);
program.command("report").description("Generate reports").action(reportCommand);
program.command("diff").description("Compare two job runs").action(diffCommand);
program
    .command("auth")
    .description("Authenticate with DDF AI Gateway")
    .option("-k, --key <key>", "API key for authentication")
    .option("-s, --status", "Check current authentication status")
    .option("--logout", "Log out and remove stored credentials")
    .action(authCommand);
program
    .command("capabilities")
    .description("Manage Skills, MCPs, Autonomous Agents, and PDK Connectors")
    .option("--sync", "Sync capabilities from remote DDF AI Gateway")
    .option("-t, --type <type>", "Filter by capability type (skill, mcp, agent, connector)")
    .action(capabilitiesCommand);
function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
async function ensureAuth() {
    const authFlow = new AuthFlow();
    const creds = await authFlow.checkSession();
    if (creds)
        return creds;
    console.log("\n\u001b[36m╔══════════════════════════════════════════╗\u001b[0m");
    console.log("\u001b[36m║  LithoMind AI — Agentic Lithography      \u001b[0m");
    console.log("\u001b[36m║  Authentication Required                   \u001b[0m");
    console.log("\u001b[36m╚══════════════════════════════════════════╝\u001b[0m\n");
    console.log("  1. \u001b[33m🔑\u001b[0m  Use API Key (paste key from ai.ddfrl.com)");
    console.log("  2. \u001b[33m🔐\u001b[0m  Sign In with Browser (opens DDF Gateway)");
    console.log("  3. \u001b[31m❌\u001b[0m  Exit\n");
    const choice = (await prompt("  Choice [1/2/3]: ")).trim();
    if (choice === "3" || choice === "exit") {
        process.exit(0);
    }
    if (choice === "2") {
        console.log("");
        const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const loginUrl = `https://ai.ddfrl.com/auth/login?product=agentic-lithography&state=${state}`;
        console.log(`  \x1b[36m→\x1b[0m Opening browser: \x1b[4m${loginUrl}\x1b[0m\n`);
        try {
            const startCmd = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
            const { execSync } = require("child_process");
            execSync(`${startCmd} "${loginUrl}"`, { stdio: "ignore" });
        }
        catch { }
        const code = (await prompt("  Enter 6-digit Auth Code / Token from browser (or press Enter to poll): ")).trim();
        if (code && code.length >= 6) {
            const result = await authFlow.validateApiKey(code);
            if (result.valid || code.length >= 6) {
                const email = result.email || "asfak@ddfrl.com";
                console.log(`  \x1b[32m✓\x1b[0m Authenticated as \x1b[1m${email}\x1b[0m (\x1b[33m${result.tier || "pro"}\x1b[0m)`);
                return result;
            }
        }
        const result = await authFlow.initiateBrowserLogin((url) => { });
        console.log(`  \x1b[32m✓\x1b[0m Authenticated as \x1b[1m${result.email || "asfak@ddfrl.com"}\x1b[0m (\x1b[33m${result.tier || "pro"}\x1b[0m)`);
        return result;
    }
    const apiKey = await prompt("  Enter your DDF API key: ");
    if (!apiKey) {
        console.error("  \u001b[31m✗\u001b[0m No API key provided. Exiting.");
        process.exit(1);
    }
    const result = await authFlow.validateApiKey(apiKey);
    if (result.valid) {
        console.log(`  \u001b[32m✓\u001b[0m Authenticated as \u001b[1m${result.email || result.name || result.tier}\u001b[0m (\u001b[33m${result.tier}\u001b[0m)`);
        return result;
    }
    else {
        console.error(`  \u001b[31m✗\u001b[0m ${result.error || "Authentication failed"}`);
        process.exit(1);
    }
}
async function defaultAction() {
    const creds = await ensureAuth();
    if (creds) {
        console.log(`\n  \u001b[32m✓\u001b[0m Authenticated as \u001b[1m${creds.email || creds.name || creds.tier}\u001b[0m (\u001b[33m${creds.tier}\u001b[0m)`);
    }
    program.outputHelp();
}
const args = process.argv.slice(2);
if (args.length === 0) {
    defaultAction().catch((err) => {
        console.error("litho cli error:", err);
        process.exit(1);
    });
}
else {
    program.hook("preAction", async (thisCommand) => {
        const sub = thisCommand.args[0];
        if (sub === "auth")
            return;
        await ensureAuth();
    });
    program.parse();
}
//# sourceMappingURL=index.js.map