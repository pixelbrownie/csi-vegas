# backend/main.py
# FastAPI server — wraps all agents as REST API endpoints
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from scenario_generator import generate_case
from orchestrator import orchestrate
from llm_client import LLMUnavailableError, llm_health_status
from memory import clear_memory, store_memory

app = FastAPI(title="CSI Vegas API", version="1.0.0")

# Public JSON API (no cookie auth). Wildcard avoids broken handshakes from
# GitHub Pages custom domains, other static hosts, or forked deployments.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    reasoning: str
    audit: dict
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
    return {
        "status": "ok",
        "message": "CSI Vegas backend running",
        "llm": llm_health_status(),
    }


@app.get("/wake")
def wake():
    """
    Cheap request intended to spin up free-tier hosts without generating a case.
    The frontend calls this on page load.
    """
    return {"status": "ok"}


@app.head("/wake")
def wake_head():
    return Response(status_code=204)


def _new_case_payload():
    """Shared case generation used by POST (and safe wake/no-op methods)."""
    case = generate_case()
    
    # RAG: Clear memory for a new investigation
    clear_memory()
    
    case_file = (
        f"A body was discovered at the Bellagio. "
        f"Victim: {case['victim']['name']}, "
        f"a {case['victim']['role']}. "
        f"Location: {case.get('location', 'High-stakes Room')}. "
        "Investigation begins."
    )
    
    # RAG: Store initial case facts
    store_memory(case_file, "narrator")
    store_memory(f"Victim: {case['victim']['name']}, Role: {case['victim']['role']}", "evidence")
    
    return {
        "case": case,
        "case_file": case_file,
    }


@app.post("/new-case")
def new_case():
    """Generate a fresh crime scenario."""
    try:
        return _new_case_payload()
    except LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.head("/new-case")
def new_case_head():
    """
    Some proxies / cached frontends probe endpoints with HEAD.
    Avoid returning 405 so CORS middleware can still attach headers on errors.
    """
    return Response(status_code=204)


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
        # Ensure we return exactly what ChatResponse expects
        return ChatResponse(
            agent=result["agent"],
            response=result["response"],
            reasoning=result["reasoning"],
            audit=result["audit"],
            updated_case_file=result["updated_case_file"]
        )
    except LLMUnavailableError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
