"""FastAPI application entry point for the ResiliNet AI triage service."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.triage import router as triage_router
from services.classifier import build_or_load_model
from services.signal_store import state


@asynccontextmanager
async def lifespan(_: FastAPI):
    state.model = build_or_load_model()
    yield


app = FastAPI(title="ResiliNet AI Triage", version="1.0.0", lifespan=lifespan)

# Allows all localhost/127.0.0.1 Next.js ports, including 3000, 3001, and 3002.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage_router)
