export type IntentType =
  | "run_opc"
  | "run_ilt"
  | "run_smo"
  | "simulate"
  | "what_if"
  | "rca_investigate"
  | "query_kg"
  | "generate_report"
  | "compare_runs"
  | "schedule_job"
  | "general_query";

export interface Intent {
  type: IntentType;
  confidence: number;
  entities: IntentEntity[];
  rawQuery: string;
}

export interface IntentEntity {
  type: "layout" | "layer" | "parameter" | "recipe" | "date_range" | "job_id";
  value: string;
  start?: number;
  end?: number;
}
