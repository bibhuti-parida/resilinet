"""Request models and internal signal representation."""

from typing import Literal

from pydantic import BaseModel, Field


class TriageRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    mesh_node: str = Field(min_length=1, max_length=80)
    sector: str = Field(min_length=1, max_length=120)


class ActiveSignal(BaseModel):
    id: str
    text: str
    priority: int
    confidence: float
    category: str
    latitude: float
    longitude: float
    mesh_node: str
    sector: str
    status: Literal["New"] = "New"
    merged_duplicates: int = 0
    received_at: int
    processing_ms: float


def signal_payload(signal: ActiveSignal) -> dict[str, object]:
    """Convert the internal snake-case signal to the client's camel-case contract."""
    return {
        "id": signal.id,
        "text": signal.text,
        "priority": signal.priority,
        "confidence": signal.confidence,
        "category": signal.category,
        "latitude": signal.latitude,
        "longitude": signal.longitude,
        "meshNode": signal.mesh_node,
        "sector": signal.sector,
        "status": signal.status,
        "mergedDuplicates": signal.merged_duplicates,
        "receivedAt": signal.received_at,
        "processingMs": signal.processing_ms,
    }
