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


def _groq_chat(messages: list[dict[str, str]], purpose: str) -> str:
    api_key = _get_api_key()
    if not api_key:
        raise LLMUnavailableError("GROQ_API_KEY is not set")
    url = f"{GROQ_BASE_URL}/chat/completions"
    payload: dict[str, Any] = {
        "model": GROQ_MODEL,
        "messages": messages,
        "temperature": GROQ_TEMPERATURE,
        "max_tokens": GROQ_MAX_TOKENS,
    }

    data = json.dumps(payload).encode("utf-8")
    last_error: Exception | None = None

    for attempt in range(1, max(1, GROQ_RETRIES) + 1):
        request = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent": GROQ_USER_AGENT,
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=GROQ_TIMEOUT_S) as response:
                raw = response.read().decode("utf-8", errors="replace")
            body = json.loads(raw)
            choices = body.get("choices") or []
            if not choices:
                raise RuntimeError(f"Groq returned no choices: {raw[:500]}")
            content = (choices[0].get("message") or {}).get("content")
            if content is None or not str(content).strip():
                raise RuntimeError("Groq returned empty content")
            return str(content).strip()
        except urllib.error.HTTPError as exc:
            try:
                err_body = exc.read().decode("utf-8", errors="replace")
            except Exception:
                err_body = ""
            try:
                err_json = json.loads(err_body)
                detail = err_json.get("error", {})
                msg = detail.get("message", err_body[:300])
            except Exception:
                msg = err_body[:300] or str(exc)
            last_error = RuntimeError(f"Groq HTTP {exc.code}: {msg}")
            # Cloudflare blocks (403) sometimes clear after retry; rate limits and server errors too.
            if exc.code in (403, 429, 500, 502, 503) and attempt < GROQ_RETRIES:
                logger.warning("Groq request failed (%s), retrying attempt %s/%s", last_error, attempt, GROQ_RETRIES)
                time.sleep(GROQ_RETRY_DELAY_MS / 1000.0)
                continue
            raise LLMUnavailableError(f"{purpose}: {last_error}") from last_error
        except LLMUnavailableError:
            raise
        except Exception as exc:
            last_error = exc
            if attempt < GROQ_RETRIES:
                time.sleep(GROQ_RETRY_DELAY_MS / 1000.0)
                continue
            raise LLMUnavailableError(f"{purpose}: {exc}") from exc

    raise LLMUnavailableError(f"{purpose}: {last_error}")


def invoke_llm(prompt: str, purpose: str) -> str:
    """
    Single-turn completion via Groq chat/completions.
    """
    if not is_live_llm_enabled():
        raise LLMUnavailableError("GROQ_API_KEY is not set; cannot call Groq")
    messages = [{"role": "user", "content": prompt}]
    return _groq_chat(messages, purpose)


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
