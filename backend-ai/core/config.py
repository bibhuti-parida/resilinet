"""Shared constants for the triage service."""

from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "disaster_triage_model.pkl"
DEDUPLICATION_RADIUS_METERS = 50.0

PRIORITY_CATEGORIES = {
    1: "Critical / Immediate Danger",
    2: "Medical Assistance",
    3: "Resource Need",
    4: "General Information",
}
