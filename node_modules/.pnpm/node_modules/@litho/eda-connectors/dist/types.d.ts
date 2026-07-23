export type EDATaskType = "opc" | "drc" | "lvs" | "simulation" | "extraction";
export interface EDAConfig {
    name: string;
    vendor: string;
    version: string;
    executablePath?: string;
    licenseServer?: string;
    timeoutMs: number;
}
export interface EDATask {
    id: string;
    type: EDATaskType;
    inputFiles: string[];
    outputDir: string;
    parameters: Record<string, unknown>;
}
export interface EDAResult {
    taskId: string;
    status: "success" | "failed" | "partial";
    outputFiles: string[];
    metrics: Record<string, number>;
    logs: string[];
    duration: number;
}
export declare abstract class EDAConnector {
    abstract readonly name: string;
    abstract readonly vendor: string;
    protected config: EDAConfig;
    constructor(config: EDAConfig);
    abstract connect(): Promise<boolean>;
    abstract disconnect(): Promise<void>;
    abstract execute(task: EDATask): Promise<EDAResult>;
    abstract getStatus(): Promise<{
        connected: boolean;
        licenseValid: boolean;
    }>;
    protected validateTask(task: EDATask): void;
}
//# sourceMappingURL=types.d.ts.map