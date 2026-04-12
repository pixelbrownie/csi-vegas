# scenario_generator.py
# Phase 2 — Generates a unique Vegas crime scenario each game

import json
import random
import re
import logging
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

from llm_client import invoke_llm, is_live_llm_enabled, LLMUnavailableError

logger = logging.getLogger(__name__)

class Suspect(BaseModel):
    name: str
    motive: str
    alibi: str
    trait: str

class Victim(BaseModel):
    name: str
    role: str

class Case(BaseModel):
    victim: Victim
    suspect_a: Suspect
    suspect_b: Suspect
    culprit: str
    murder_weapon: str
    key_clue: str

    @field_validator("culprit")
    @classmethod
    def culprit_must_match_suspects(cls, v: str, info):
        data = info.data
        if 'suspect_a' in data and 'suspect_b' in data:
            names = [data['suspect_a'].name, data['suspect_b'].name]
            if v not in names:
                raise ValueError(f"culprit '{v}' must match either suspect_a.name or suspect_b.name: {names}")
        return v

FALLBACK_CASES = [
    {
        "victim": {"name": "Marco Delgado", "role": "high-stakes poker dealer"},
        "suspect_a": {
            "name": "Veronica Sloane",
            "motive": "caught the victim skimming the tip pool",
            "alibi": "couples massage at the spa until midnight",
            "trait": "icy, composed, and extremely observant",
        },
        "suspect_b": {
            "name": "Danny Ricci",
            "motive": "owed fifty large after a bad marker",
            "alibi": "throwing dice at the craps pit, cameras can confirm",
            "trait": "sweaty, fast-talking, desperate gambler",
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
            "trait": "arrogant, dismissive music producer",
        },
        "suspect_b": {
            "name": "Rita Morrow",
            "motive": "jealous understudy passed over for the Friday slot",
            "alibi": "front row for the early show, ushers remember her",
            "trait": "fake-sweet, overly dramatic actress",
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
            "trait": "efficient, exhausted, highly defensive",
        },
        "suspect_b": {
            "name": "Calvin Briggs",
            "motive": "rumored side deals with junket operators",
            "alibi": "smoke break alley — no witnesses, admits it",
            "trait": "slick, overly confident hustler",
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
            "trait": "sharp, highly professional, secretly ruthless",
        },
        "suspect_b": {
            "name": "Theo Brand",
            "motive": "blackmail over off-menu perks",
            "alibi": "claims he was on a helicopter tour — flight log missing a page",
            "trait": "entitled, easily irritated trust fund kid",
        },
        "culprit": "Priya Shah",
        "murder_weapon": "a broken champagne stem left in the private skybox",
        "key_clue": "Priya's signature scarlet lipstick on the glass shard",
    },
]


def _generate_case_llm() -> dict:
    prompt = """Generate a NEW Las Vegas murder mystery scenario as a single JSON object.
Required keys:
- victim: { name: str, role: str }
- suspect_a: { name: str, motive: str, alibi: str, trait: str }
- suspect_b: { name: str, motive: str, alibi: str, trait: str }
- culprit: string (MUST exactly match name of suspect_a or suspect_b)
- murder_weapon: string (Vegas themed)
- key_clue: string (specific evidence item)

Rules:
1. Invent fresh, noir-style names.
2. The alibis should be plausible but one should have a subtle hole.
3. Assign each suspect a distinct, strong personality `trait` (e.g. arrogant high-roller, defensive burnout).
4. Return ONLY raw JSON. No markdown fences.
"""

    last_error = None
    for attempt in range(3):
        try:
            raw = invoke_llm(prompt, f"generate_case attempt={attempt + 1}")
            # Try to find JSON block
            match = re.search(r"(\{.*\})", raw, re.DOTALL)
            json_str = match.group(1) if match else raw
            
            case_data = json.loads(json_str)
            # Pydantic validation
            validated_case = Case(**case_data)
            return validated_case.model_dump()
        except Exception as exc:
            logger.warning(f"Attempt {attempt + 1} failed: {exc}")
            last_error = exc

    raise LLMUnavailableError(f"generate_case failed after 3 attempts: {last_error}")


def generate_case():
    """
    Generate a random Vegas murder scenario.
    Uses a remote LLM when enabled; otherwise rotates through scripted cases.
    """
    if is_live_llm_enabled():
        try:
            return _generate_case_llm()
        except Exception as e:
            logger.warning("Groq case generation failed, using scripted case: %s", e)
            return random.choice(FALLBACK_CASES)
    return random.choice(FALLBACK_CASES)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Generating case...\n")
    case = generate_case()
    print(json.dumps(case, indent=2))
