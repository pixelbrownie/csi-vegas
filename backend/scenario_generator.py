# scenario_generator.py
# Phase 2 — Generates a unique Vegas crime scenario each game
# The "ground truth" only the Witness agent knows

import re
import json
from llm_client import invoke_llm

def generate_case():
    """
    Generate a random Vegas murder mystery scenario.
    Returns a dict with victim, suspects, culprit, weapon, and key clue.
    Strict live LLM mode: fails if model output is invalid.
    """
    prompt = """Generate a short Las Vegas crime scenario as JSON with exactly these keys:
- victim: object with keys "name" (string) and "role" (string, e.g. "casino dealer")
- suspect_a: object with keys "name", "motive", "alibi"
- suspect_b: object with keys "name", "motive", "alibi"
- culprit: string, must be the exact value of either suspect_a.name or suspect_b.name
- murder_weapon: string, something Vegas-themed (e.g. "a loaded dice")
- key_clue: string, one piece of hidden evidence

Make it dramatic and Vegas-flavored. Return ONLY valid JSON. No intro text, no markdown, no explanation."""

    required_keys = ["victim", "suspect_a", "suspect_b", "culprit", "murder_weapon", "key_clue"]
    last_error = None

    for attempt in range(3):
        try:
            raw = invoke_llm(prompt, f"generate_case attempt={attempt + 1}")
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if not match:
                raise ValueError("No JSON object found in LLM response")

            case = json.loads(match.group())
            for key in required_keys:
                if key not in case:
                    raise ValueError(f"Missing key in generated case: {key}")
            return case
        except Exception as exc:
            last_error = exc

    raise RuntimeError(f"generate_case failed after retries: {last_error}")


if __name__ == "__main__":
    print("Generating case...\n")
    case = generate_case()
    print(json.dumps(case, indent=2))
