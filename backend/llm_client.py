import os
import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class LLMUnavailableError(RuntimeError):
    """Raised when Groq inference fails after retries or the API key is missing."""

# Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GROQ_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()
GEMINI_TIMEOUT_S = float(os.getenv("GEMINI_TIMEOUT_S", "120"))
GEMINI_RETRIES = int(os.getenv("GEMINI_RETRIES", "3"))
GEMINI_RETRY_DELAY_MS = int(os.getenv("GEMINI_RETRY_DELAY_MS", "500"))

def _get_api_key() -> str:
    """Read the API key lazily so dotenv always has a chance to run first."""
    return GEMINI_API_KEY

def is_live_llm_enabled() -> bool:
    return bool(_get_api_key())

def _gemini_chat(prompt: str, purpose: str) -> str:
    api_key = _get_api_key()
    if not api_key:
        raise LLMUnavailableError("GEMINI_API_KEY is not set")
    
    url = f"https://generativelanguage.googleapis.com/v1/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts":[{"text": prompt}]}]
    }

    data = json.dumps(payload).encode("utf-8")
    last_error: Exception | None = None

    for attempt in range(1, max(1, GEMINI_RETRIES) + 1):
        request = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=GEMINI_TIMEOUT_S) as response:
                raw = response.read().decode("utf-8", errors="replace")
            body = json.loads(raw)
            candidates = body.get("candidates") or []
            if not candidates:
                raise RuntimeError(f"Gemini returned no candidates: {raw[:500]}")
            text_parts = candidates[0].get("content", {}).get("parts") or []
            if not text_parts:
                raise RuntimeError("Gemini returned empty parts")
            return str(text_parts[0].get("text", "")).strip()
        except urllib.error.HTTPError as exc:
            try:
                err_body = exc.read().decode("utf-8", errors="replace")
            except Exception:
                err_body = ""
            last_error = RuntimeError(f"Gemini HTTP {exc.code}: {err_body[:300]}")
            if exc.code in (429, 500, 502, 503) and attempt < GEMINI_RETRIES:
                time.sleep(GEMINI_RETRY_DELAY_MS / 1000.0)
                continue
            raise LLMUnavailableError(f"{purpose}: {last_error}") from last_error
        except Exception as exc:
            last_error = exc
            if attempt < GEMINI_RETRIES:
                time.sleep(GEMINI_RETRY_DELAY_MS / 1000.0)
                continue
            raise LLMUnavailableError(f"{purpose}: {exc}") from exc

    raise LLMUnavailableError(f"{purpose}: {last_error}")

def invoke_llm(prompt: str, purpose: str) -> str:
    """Single-turn completion via Native Gemini REST API."""
    if not is_live_llm_enabled():
        raise LLMUnavailableError("API_KEY is not set")
    return _gemini_chat(prompt, purpose)

def llm_health_status() -> dict:
    if not is_live_llm_enabled():
        return {
            "ok": True,
            "mode": "offline",
            "note": "scripted scenarios — set GEMINI_API_KEY for live mode",
        }
    return {
        "ok": True,
        "mode": "live",
        "provider": "google",
        "model": GEMINI_MODEL,
        "note": "Native Gemini Flash API",
    }