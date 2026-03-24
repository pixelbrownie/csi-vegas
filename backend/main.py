# backend/main.py
# FastAPI server — wraps all agents as REST API endpoints
# Run with: uvicorn main:app --reload --port 8000

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json

from scenario_generator import generate_case
from orchestrator import orchestrate

app = FastAPI(title="CSI Vegas API", version="1.0.0")

# Allow React dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
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

@app.get("/health")
def health():
    return {"status": "ok", "message": "CSI Vegas backend running"}


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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))