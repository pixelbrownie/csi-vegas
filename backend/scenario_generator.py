# scenario_generator.py
# Phase 2 — Generates a unique Vegas crime scenario each game
# The "ground truth" only the Witness agent knows

import re
import json
import random
from langchain_community.llms import Ollama

llm = Ollama(model="mistral")
LLM_AVAILABLE = True

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


def _random_fallback_case():
    """
    Build a fresh case locally when LLM/Ollama is unavailable.
    Ensures "New Case" always feels new in production fallback mode.
    """
    victims = [
        {"name": "Marco Delgado", "role": "high-stakes poker dealer"},
        {"name": "Elena Cruz", "role": "casino pit boss"},
        {"name": "Victor Hale", "role": "security supervisor"},
        {"name": "Rina Patel", "role": "VIP host"},
    ]
    suspect_pool = [
        {
            "name": "Veronica Sloane",
            "motive": "the victim caught her skimming chips",
            "alibi": "she claims she stayed at the spa all evening",
        },
        {
            "name": "Danny 'Two-Shoes' Ricci",
            "motive": "he was owed a six-figure gambling debt",
            "alibi": "he says he was at the craps table with regulars",
        },
        {
            "name": "Milo Vance",
            "motive": "the victim threatened to expose his fixed roulette ring",
            "alibi": "he insists he never left the valet entrance",
        },
        {
            "name": "Cassie Monroe",
            "motive": "the victim was about to leak her fake-ID operation",
            "alibi": "she says she was handling a private suite complaint",
        },
        {
            "name": "Jared Knox",
            "motive": "the victim ruined his shot at a casino promotion",
            "alibi": "he claims to have been in the surveillance office",
        },
    ]
    weapons = [
        "a weighted poker chip sleeve",
        "a sharpened baccarat shoe edge",
        "a lead-lined dice cup",
        "a broken champagne sabre from the VIP lounge",
        "a steel cocktail skewer from the rooftop bar",
    ]
    clues = [
        "A monogrammed casino loyalty card found under the victim",
        "A blood-specked valet ticket stamped 10:07 PM",
        "A cracked room keycard recovered near the high-rollers elevator",
        "A lipstick-marked cocktail receipt signed with initials only",
        "A surveillance blind spot report deleted minutes before the murder",
    ]

    victim = random.choice(victims)
    suspect_a, suspect_b = random.sample(suspect_pool, 2)
    culprit = random.choice([suspect_a["name"], suspect_b["name"]])

    return {
        "victim": victim,
        "suspect_a": suspect_a,
        "suspect_b": suspect_b,
        "culprit": culprit,
        "murder_weapon": random.choice(weapons),
        "key_clue": random.choice(clues),
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

    global LLM_AVAILABLE
    try:
        if not LLM_AVAILABLE:
            raise RuntimeError("LLM unavailable")
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
        LLM_AVAILABLE = False
        print(f"[scenario_generator] Failed to parse LLM response: {e}")
        print("[scenario_generator] Using randomized fallback case.")
        return _random_fallback_case()


if __name__ == "__main__":
    print("Generating case...\n")
    case = generate_case()
    print(json.dumps(case, indent=2))
