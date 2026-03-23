# scenario_generator.py
# Phase 2 — Generates a unique Vegas crime scenario each game
# The "ground truth" only the Witness agent knows

import re
import json
from langchain_community.llms import Ollama

llm = Ollama(model="mistral")

FALLBACK_CASE = {
    "victim": {"name": "Marco Delgado", "role": "high-stakes poker dealer"},
    "suspect_a": {
        "name": "Veronica Sloane",
        "motive": "Delgado witnessed her skimming chips",
        "alibi": "Claims she was in the spa all evening"
    },
    "suspect_b": {
        "name": "Danny 'Two-Shoes' Ricci",
        "motive": "Delgado owed him $200,000",
        "alibi": "Says he was at a craps table with friends"
    },
    "culprit": "Danny 'Two-Shoes' Ricci",
    "murder_weapon": "a weighted poker chip sleeve",
    "key_clue": "A monogrammed casino loyalty card found under the victim"
}

def generate_case():
    """
    Generate a random Vegas murder mystery scenario.
    Returns a dict with victim, suspects, culprit, weapon, and key clue.
    Falls back to a hardcoded case if the LLM response can't be parsed.
    """
    prompt = """Generate a short Las Vegas crime scenario as JSON with exactly these keys:
- victim: object with keys "name" (string) and "role" (string, e.g. "casino dealer")
- suspect_a: object with keys "name", "motive", "alibi"
- suspect_b: object with keys "name", "motive", "alibi"
- culprit: string, must be the exact value of either suspect_a.name or suspect_b.name
- murder_weapon: string, something Vegas-themed (e.g. "a loaded dice")
- key_clue: string, one piece of hidden evidence

Make it dramatic and Vegas-flavored. Return ONLY valid JSON. No intro text, no markdown, no explanation."""

    try:
        raw = llm.invoke(prompt)

        # Extract JSON block even if the LLM adds surrounding text
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found in LLM response")

        case = json.loads(match.group())

        # Basic validation
        required_keys = ["victim", "suspect_a", "suspect_b", "culprit", "murder_weapon", "key_clue"]
        for key in required_keys:
            if key not in case:
                raise ValueError(f"Missing key in generated case: {key}")

        return case

    except Exception as e:
        print(f"[scenario_generator] Failed to parse LLM response: {e}")
        print("[scenario_generator] Using fallback case.")
        return FALLBACK_CASE


if __name__ == "__main__":
    print("Generating case...\n")
    case = generate_case()
    print(json.dumps(case, indent=2))