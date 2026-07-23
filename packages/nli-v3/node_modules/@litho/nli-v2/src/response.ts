import type { UserIntent, NLIResponse } from "./types.js";

export class ResponseGenerator {
  async generate(intent: UserIntent, context: Map<string, unknown>): Promise<NLIResponse> {
    const message = this.generateMessage(intent);
    const actions = this.generateActions(intent);
    const suggestions = this.generateSuggestions(intent, context);

    return {
      message,
      intent,
      actions,
      suggestions,
      confidence: intent.confidence,
    };
  }

  private generateMessage(intent: UserIntent): string {
    switch (intent.name) {
      case "run_opc":
        return "I'll start the OPC correction process for you. The job has been submitted to the queue.";
      case "analyze_layout":
        return "I'm analyzing the layout for potential issues. This may take a few moments.";
      case "simulate":
        return "Running lithography simulation with the current parameters.";
      case "check_drc":
        return "Performing Design Rule Check on the specified layers.";
      case "optimize_mask":
        return "Starting ILT mask optimization. This is a computationally intensive process.";
      case "get_report":
        return "Generating the requested report. I'll have it ready shortly.";
      case "set_pdk":
        return "PDK has been loaded and configured. All layer parameters are now available.";
      case "configure_gpu":
        return "GPU resources have been allocated. The cluster is ready for computation.";
      case "rca_investigate":
        return "Initiating Root Cause Analysis. I'll traverse the Knowledge Graph to find causal relationships.";
      case "show_pareto":
        return "Here are the Pareto-optimal solutions from the multi-objective optimization.";
      default:
        return "I understand your request. Let me process that for you.";
    }
  }

  private generateActions(intent: UserIntent): Array<{ type: string; target: string; parameters: Record<string, unknown> }> {
    const actions: Array<{ type: string; target: string; parameters: Record<string, unknown> }> = [];

    switch (intent.name) {
      case "run_opc":
        actions.push({ type: "submit_job", target: "opc_pipeline", parameters: intent.slots });
        break;
      case "analyze_layout":
        actions.push({ type: "run_agent", target: "layout_understanding", parameters: intent.slots });
        break;
      case "rca_investigate":
        actions.push({ type: "run_agent", target: "rca_agent", parameters: intent.slots });
        break;
      case "show_pareto":
        actions.push({ type: "run_optimizer", target: "moo_optimizer", parameters: intent.slots });
        break;
    }

    return actions;
  }

  private generateSuggestions(intent: UserIntent, context: Map<string, unknown>): string[] {
    const suggestions: string[] = [];

    switch (intent.name) {
      case "run_opc":
        suggestions.push("Check EPE results after completion", "Compare with previous runs", "View GPU utilization");
        break;
      case "analyze_layout":
        suggestions.push("Run DRC check", "Identify hotspots", "Generate report");
        break;
      case "rca_investigate":
        suggestions.push("View causal graph", "Check Digital Twin validation", "Apply fix recommendations");
        break;
      default:
        suggestions.push("Show job status", "View recent reports", "Check system metrics");
    }

    return suggestions;
  }
}
