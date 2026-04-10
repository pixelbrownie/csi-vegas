# scenario_generator.py
# Phase 2 — Generates a unique Vegas crime scenario each game

import json
import random
import re
from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError

FALLBACK_CASES = [
    {
        "victim": {"name": "Marco Delgado", "role": "high-stakes poker dealer"},
        "suspect_a": {
            "name": "Veronica Sloane",
            "motive": "caught the victim skimming the tip pool",
            "alibi": "couples massage at the spa until midnight",
        },
        "suspect_b": {
            "name": "Danny Ricci",
            "motive": "owed fifty large after a bad marker",
            "alibi": "throwing dice at the craps pit, cameras can confirm",
        },
        "culprit": "Danny Ricci",
        "murder_weapon": "a weighted poker chip sleeve",
        "key_clue": "monogrammed loyalty card slid under the body",
    },
    {
        "victim": {"name": "Amber Vale", "role": "headliner vocalist at a Strip lounge"},
        "suspect_a": {
            "name": "Felix Kwan",
            "motive": "Amber threatened to expose his off-book booking fees",
            "alibi": "sound check until 10, then green room with the band",
        },
        "suspect_b": {
            "name": "Rita Morrow",
            "motive": "jealous understudy passed over for the Friday slot",
            "alibi": "front row for the early show, ushers remember her",
        },
        "culprit": "Felix Kwan",
        "murder_weapon": "a snapped microphone cable tightened like a garrote",
        "key_clue": "stage glitter in the victim's collar that only Felix's rig uses",
    },
    {
        "victim": {"name": "Hector Ruiz", "role": "pit boss at a Fremont casino"},
        "suspect_a": {
            "name": "Nina Ortiz",
            "motive": "Hector froze her comp accounts after a dispute",
            "alibi": "inventory count in the back office with two cameras",
        },
        "suspect_b": {
            "name": "Calvin Briggs",
            "motive": "rumored side deals with junket operators",
            "alibi": "smoke break alley — no witnesses, admits it",
        },
        "culprit": "Calvin Briggs",
        "murder_weapon": "a brass dealer's buckle turned blunt instrument",
        "key_clue": "faint oil stain on the buckle matching Calvin's vintage watch band",
    },
    {
        "victim": {"name": "Jordan Ellis", "role": "VIP host for a megaresort"},
        "suspect_a": {
            "name": "Priya Shah",
            "motive": "Jordan poached her whale clients",
            "alibi": "client dinner at Nobu, receipt timestamped",
        },
        "suspect_b": {
            "name": "Theo Brand",
            "motive": "blackmail over off-menu perks",
            "alibi": "claims he was on a helicopter tour — flight log missing a page",
        },
        "culprit": "Priya Shah",
        "murder_weapon": "a broken champagne stem left in the private skybox",
        "key_clue": "Priya's signature scarlet lipstick on the glass shard",
    },
]


def _generate_case_llm() -> dict:
    prompt = """Generate a NEW Las Vegas murder mystery scenario as a single JSON object with exactly these keys:
- victim: object with keys "name" (string) and "role" (string, e.g. "casino dealer")
- suspect_a: object with keys "name", "motive", "alibi"
- suspect_b: object with keys "name", "motive", "alibi"
- culprit: string, MUST exactly equal suspect_a.name OR suspect_b.name (same spelling)
- murder_weapon: string, something Vegas-themed
- key_clue: string, one specific hidden evidence item the detective could find

Rules: Invent fresh names and motives every time — do not reuse famous examples. Keep alibis concrete.
Return ONLY raw JSON. No markdown fences, no commentary before or after the JSON."""

    required_keys = ["victim", "suspect_a", "suspect_b", "culprit", "murder_weapon", "key_clue"]
    last_error = None

    for attempt in range(3):
        try:
            raw = invoke_llm(prompt, f"generate_case attempt={attempt + 1}")
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            if not match:
                raise ValueError("No JSON object found in LLM response")

            case = json.loads(match.group())
            for key in required_keys:
                if key not in case:
                    raise ValueError(f"Missing key in generated case: {key}")
            culprit = case["culprit"]
            names = [case["suspect_a"]["name"], case["suspect_b"]["name"]]
            if culprit not in names:
                raise ValueError(f"culprit {culprit!r} must match suspect_a.name or suspect_b.name: {names}")
            return case
        except LLMUnavailableError:
            raise
        except Exception as exc:
            last_error = exc

    raise LLMUnavailableError(f"generate_case failed after retries: {last_error}")


def generate_case():
    """
    Generate a random Vegas murder scenario.
    Uses a remote LLM when enabled; otherwise rotates through scripted cases.
    """
    if is_live_llm_enabled():
        return _generate_case_llm()
    return random.choice(FALLBACK_CASES)


if __name__ == "__main__":
    print("Generating case...\n")
    case = generate_case()
    print(json.dumps(case, indent=2))
