import heapq
from typing import Any


class PriorityQueue:
    def __init__(self):
        self._queue: list[tuple[int, int, dict]] = []
        self._counter = 0

    def enqueue(self, job: dict):
        priority = job.get("priority", 0)
        heapq.heappush(self._queue, (-priority, self._counter, job))
        self._counter += 1

    def dequeue(self) -> dict | None:
        if not self._queue:
            return None
        _, _, job = heapq.heappop(self._queue)
        return job

    def peek(self) -> dict | None:
        if not self._queue:
            return None
        return self._queue[0][2]

    def size(self) -> int:
        return len(self._queue)

    def is_empty(self) -> bool:
        return len(self._queue) == 0

    def remove_job(self, job_id: str) -> bool:
        for i, (_, _, job) in enumerate(self._queue):
            if job.get("job_id") == job_id:
                self._queue.pop(i)
                heapq.heapify(self._queue)
                return True
        return False
