#!/usr/bin/env node
import { Command } from "commander";
import { runCommand } from "./commands/run.js";
import { askCommand } from "./commands/ask.js";
import { twinCommand } from "./commands/twin.js";
import { reportCommand } from "./commands/report.js";
import { diffCommand } from "./commands/diff.js";
import { authCommand } from "./commands/auth.js";
import { capabilitiesCommand } from "./commands/capabilities.js";

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
  .action(authCommand);

program
  .command("capabilities")
  .description("Manage Skills, MCPs, Autonomous Agents, and PDK Connectors")
  .option("--sync", "Sync capabilities from remote DDF AI Gateway")
  .option("-t, --type <type>", "Filter by capability type (skill, mcp, agent, connector)")
  .action(capabilitiesCommand);

program.parse();
