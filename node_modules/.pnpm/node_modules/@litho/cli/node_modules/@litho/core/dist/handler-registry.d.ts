export type HandlerFn = (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
export declare class HandlerRegistry {
    private handlers;
    register(name: string, handler: HandlerFn): void;
    get(name: string): HandlerFn | undefined;
    list(): string[];
}
//# sourceMappingURL=handler-registry.d.ts.map