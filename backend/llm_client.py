import os
import time
import urllib.request
import json
from urllib.parse import urljoin

class LLMUnavailableError(RuntimeError):
    """Raised when live Ollama inference is required but unavailable."""


OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral:latest").strip() or "mistral:latest"
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").strip() or "http://127.0.0.1:11434"
OLLAMA_RETRIES = int(os.getenv("OLLAMA_RETRIES", "3"))
OLLAMA_RETRY_DELAY_MS = int(os.getenv("OLLAMA_RETRY_DELAY_MS", "450"))
OLLAMA_TIMEOUT_S = float(os.getenv("OLLAMA_TIMEOUT_S", "90"))


def invoke_llm(prompt: str, purpose: str) -> str:
    """
    Strict live inference only: tries Ollama a few times, then fails hard.
    No template or keyword fallback is used.
    """
    last_error = None
    for attempt in range(1, max(1, OLLAMA_RETRIES) + 1):
        try:
            payload = json.dumps({
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            }).encode("utf-8")
            request = urllib.request.Request(
                urljoin(OLLAMA_BASE_URL.rstrip("/") + "/", "api/generate"),
                data=payload,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=OLLAMA_TIMEOUT_S) as response:
                raw = response.read().decode("utf-8", errors="replace")
            body = json.loads(raw)
            result = (body.get("response") or "").strip()
            if not result:
                raise RuntimeError("empty response from model")
            return result.strip()
        except Exception as exc:
            last_error = exc
            if attempt < OLLAMA_RETRIES:
                time.sleep(OLLAMA_RETRY_DELAY_MS / 1000.0)

    raise LLMUnavailableError(
        f"Live Ollama inference failed for {purpose}. "
        f"model={OLLAMA_MODEL}, base_url={OLLAMA_BASE_URL}, error={last_error}"
    )


def check_ollama_connection() -> dict:
    """Health probe for Ollama endpoint + model availability."""
    tags_url = urljoin(OLLAMA_BASE_URL.rstrip("/") + "/", "api/tags")
    try:
        with urllib.request.urlopen(tags_url, timeout=OLLAMA_TIMEOUT_S) as response:
            payload = response.read().decode("utf-8", errors="replace")
            has_model = OLLAMA_MODEL.split(":")[0] in payload or OLLAMA_MODEL in payload
            return {
                "ok": True,
                "base_url": OLLAMA_BASE_URL,
                "model": OLLAMA_MODEL,
                "model_detected": has_model,
            }
    except Exception as exc:
        return {
            "ok": False,
            "base_url": OLLAMA_BASE_URL,
            "model": OLLAMA_MODEL,
            "model_detected": False,
            "error": str(exc),
        }
