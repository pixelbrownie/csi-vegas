import os
import json
import logging
import time
import urllib.error
import urllib.request
from typing import Any
from dotenv import load_dotenv

load_dotenv()  # Ensure .env is loaded even if this module is imported first

logger = logging.getLogger(__name__)

class LLMUnavailableError(RuntimeError):
    """Raised when Groq inference fails after retries or the API key is missing."""


# Groq OpenAI-compatible API: https://console.groq.com/docs/openai
# Config constants (can be overridden by env vars)
GROQ_MODEL = (os.getenv("GROQ_MODEL", "llama-3.1-8b-instant").strip() or "llama-3.1-8b-instant")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").rstrip("/")
GROQ_TIMEOUT_S = float(os.getenv("GROQ_TIMEOUT_S", "120"))
GROQ_RETRIES = int(os.getenv("GROQ_RETRIES", "3"))
GROQ_RETRY_DELAY_MS = int(os.getenv("GROQ_RETRY_DELAY_MS", "500"))
GROQ_TEMPERATURE = float(os.getenv("GROQ_TEMPERATURE", "0.75"))
GROQ_MAX_TOKENS = int(os.getenv("GROQ_MAX_TOKENS", "4096"))
_DEFAULT_UA = (
    "Mozilla/5.0 (compatible; CSI-Vegas/1.0; +https://github.com) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
GROQ_USER_AGENT = (os.getenv("GROQ_USER_AGENT", "").strip() or _DEFAULT_UA)


def _get_api_key() -> str:
    """Read the API key lazily so dotenv always has a chance to run first."""
    return os.getenv("GROQ_API_KEY", "").strip()


def is_live_llm_enabled() -> bool:
    return bool(_get_api_key())


def _gemini_chat(prompt: str, purpose: str) -> str:
    api_key = _get_api_key()
    if not api_key:
        raise LLMUnavailableError("GEMINI_API_KEY is not set")
    
    # Use the STABLE v1 endpoint and Gemini 2.0 Flash (Highest reliability for demo)
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts":[{"text": prompt}]}]
    }

    data = json.dumps(payload).encode("utf-8")
    last_error: Exception | None = None

    for attempt in range(1, max(1, GROQ_RETRIES) + 1):
        request = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=GROQ_TIMEOUT_S) as response:
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
            if exc.code in (429, 500, 502, 503) and attempt < GROQ_RETRIES:
                time.sleep(GROQ_RETRY_DELAY_MS / 1000.0)
                continue
            raise LLMUnavailableError(f"{purpose}: {last_error}") from last_error
        except Exception as exc:
            last_error = exc
            if attempt < GROQ_RETRIES:
                time.sleep(GROQ_RETRY_DELAY_MS / 1000.0)
                continue
            raise LLMUnavailableError(f"{purpose}: {exc}") from exc

    raise LLMUnavailableError(f"{purpose}: {last_error}")


def invoke_llm(prompt: str, purpose: str) -> str:
    """
    Single-turn completion via Native Gemini REST API.
    """
    if not is_live_llm_enabled():
        raise LLMUnavailableError("API_KEY is not set")
    return _gemini_chat(prompt, purpose)


def llm_health_status() -> dict:
    if not is_live_llm_enabled():
        return {
            "ok": True,
            "mode": "offline",
            "note": "scripted scenarios and template replies — set GROQ_API_KEY on the server for live Groq",
        }
    return {
        "ok": True,
        "mode": "live",
        "provider": "groq",
        "model": GROQ_MODEL,
        "note": "Groq chat/completions — see https://console.groq.com/docs/models",
    }
