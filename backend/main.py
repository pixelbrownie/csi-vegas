# backend/main.py
# FastAPI server — wraps all agents as REST API endpoints
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os

from scenario_generator import generate_case
from orchestrator import orchestrate
from llm_client import check_ollama_connection, LLMUnavailableError

app = FastAPI(title="CSI Vegas API", version="1.0.0")

# Browser origins allowed to call this API (your GitHub Pages site, local dev, etc.)
_cors = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://pixelbrownie.github.io",
]
_extra = os.getenv("CORS_ORIGINS", "")
if _extra:
    _cors.extend(o.strip() for o in _extra.split(",") if o.strip())

# Regex covers GitHub Pages (Origin is always https://<user>.github.io, no path).
# If Render shows a CORS error, redeploy this service so this code is live.
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors,
    allow_origin_regex=r"^https://[a-zA-Z0-9-]+\.github\.io$",
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ─────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    case: dict
    case_file: str
    history: list

class ChatResponse(BaseModel):
    agent: str
    response: str
    updated_case_file: str

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """So the service URL in a browser and HEAD probes are not 404."""
    return {
        "service": "CSI Vegas API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health():
    llm_health = check_ollama_connection()
    status = "ok" if llm_health.get("ok") else "degraded"
    return {
        "status": status,
        "message": "CSI Vegas backend running",
        "llm": llm_health,
    }


@app.post("/new-case")
def new_case():
    """Generate a fresh crime scenario."""
    try:
        case = generate_case()
        return {
            "case": case,
            "case_file": (
                f"A body was discovered at the Bellagio. "
                f"Victim: {case['victim']['name']}, "
                f"a {case['victim']['role']}. "
                "Investigation begins."
            )
        }
    except LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    """Route a detective message to the correct agent."""
    try:
        result = orchestrate(
            req.message,
            req.case,
            req.case_file,
            str(req.history[-10:])
        )
        return ChatResponse(
            agent=result["agent"],
            response=result["response"],
            updated_case_file=result["updated_case_file"]
        )
    except LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
