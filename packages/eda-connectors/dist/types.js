export class EDAConnector {
    config;
    constructor(config) {
        this.config = config;
    }
    validateTask(task) {
        if (!task.id)
            throw new Error("Task ID is required");
        if (!task.type)
            throw new Error("Task type is required");
        if (!task.outputDir)
            throw new Error("Output directory is required");
    }
}
//# sourceMappingURL=types.js.map