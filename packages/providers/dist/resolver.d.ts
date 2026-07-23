import type { ProviderDef, EndpointResult, KayartConfig } from "./types.js";
export declare function getProvider(id: string): ProviderDef | undefined;
export declare function resolveEndpoint(spec: string): EndpointResult;
export declare function loadKayartConfig(cwd?: string): KayartConfig | null;
export declare function resolveSpec(opts?: {
    provider?: string;
    model?: string;
}): string | undefined;
//# sourceMappingURL=resolver.d.ts.map