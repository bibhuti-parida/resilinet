"""HTTP endpoints for classifying and tracking mesh distress signals."""

import time
import uuid

from fastapi import APIRouter, HTTPException

from core.config import DEDUPLICATION_RADIUS_METERS, PRIORITY_CATEGORIES
from models.schemas import ActiveSignal, TriageRequest, signal_payload
from services.classifier import classify_signal
from services.deduplication import haversine_meters
from services.signal_store import state


router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": "loaded" if state.model is not None else "loading"}


@router.post("/api/triage")
def triage(request: TriageRequest) -> dict[str, object]:
    """Classify, spatially deduplicate, and track an incoming mesh distress signal."""
    if state.model is None:
        raise HTTPException(status_code=503, detail="Triage model is not initialized")

    started = time.perf_counter()
    priority, confidence = classify_signal(state.model, request.text)
    processing_ms = round((time.perf_counter() - started) * 1000, 3)

    with state.lock:
        state.record_received(processing_ms)
        for existing in state.active_signals:
            distance_meters = haversine_meters(
                request.latitude, request.longitude, existing.latitude, existing.longitude
            )
            if distance_meters <= DEDUPLICATION_RADIUS_METERS:
                existing.merged_duplicates += 1
                state.record_duplicate()
                return {
                    "status": "dropped_by_deduplication",
                    "duplicateOf": existing.id,
                    "distanceMeters": round(distance_meters, 2),
                    "signal": signal_payload(existing),
                    "metrics": state.metrics(),
                }

        signal = ActiveSignal(
            id=f"SIG-{uuid.uuid4().hex[:8].upper()}",
            text=request.text,
            priority=priority,
            confidence=confidence,
            category=PRIORITY_CATEGORIES[priority],
            latitude=request.latitude,
            longitude=request.longitude,
            mesh_node=request.mesh_node,
            sector=request.sector,
            received_at=int(time.time() * 1000),
            processing_ms=processing_ms,
        )
        state.active_signals.append(signal)
        return {
            "status": "ingested",
            "signal": signal_payload(signal),
            "metrics": state.metrics(),
        }
