#!/usr/bin/env node
import { Command } from "commander";
import { runCommand } from "./commands/run.js";
import { askCommand } from "./commands/ask.js";
import { twinCommand } from "./commands/twin.js";
import { reportCommand } from "./commands/report.js";
import { diffCommand } from "./commands/diff.js";
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
program.parse();
//# sourceMappingURL=index.js.map