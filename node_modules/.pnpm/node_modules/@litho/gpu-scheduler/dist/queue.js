export class TaskQueue {
    tasks = [];
    enqueue(task) {
        this.tasks.push(task);
        this.tasks.sort((a, b) => b.priority - a.priority);
    }
    dequeue() {
        return this.tasks.shift();
    }
    peek() {
        return this.tasks[0];
    }
    get size() {
        return this.tasks.length;
    }
    getTasks() {
        return [...this.tasks];
    }
    getByType(type) {
        return this.tasks.filter((t) => t.type === type);
    }
    remove(taskId) {
        const index = this.tasks.findIndex((t) => t.id === taskId);
        if (index >= 0) {
            return this.tasks.splice(index, 1)[0];
        }
        return undefined;
    }
    sortByMemory() {
        return [...this.tasks].sort((a, b) => b.memoryRequired - a.memoryRequired);
    }
}
//# sourceMappingURL=queue.js.map