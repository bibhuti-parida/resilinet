"""In-memory signal state, counters, and synchronization."""

import time
from threading import Lock

from sklearn.pipeline import Pipeline

from models.schemas import ActiveSignal


class TriageState:
    """Owns volatile runtime state for a single API process."""

    def __init__(self) -> None:
        self.model: Pipeline | None = None
        self.active_signals: list[ActiveSignal] = []
        self.total_received = 0
        self.dropped_by_deduplication = 0
        self.total_processing_ms = 0.0
        self.started_at = time.monotonic()
        self.lock = Lock()

    def record_received(self, processing_ms: float) -> None:
        self.total_received += 1
        self.total_processing_ms += processing_ms

    def record_duplicate(self) -> None:
        self.dropped_by_deduplication += 1

    def metrics(self) -> dict[str, float | int]:
        elapsed_minutes = max((time.monotonic() - self.started_at) / 60, 1 / 60)
        return {
            "totalReceived": self.total_received,
            "droppedByDeduplication": self.dropped_by_deduplication,
            "activeSignals": len(self.active_signals),
            "mergedDuplicates": self.dropped_by_deduplication,
            "averageProcessingMs": round(self.total_processing_ms / self.total_received, 3)
            if self.total_received
            else 0.0,
            "throughputPerMinute": round(self.total_received / elapsed_minutes, 2),
        }


state = TriageState()
