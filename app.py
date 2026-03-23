# app.py
# Phase 4 & 5 — Streamlit UI with Vegas dark theme + countdown timer
# Run with: streamlit run app.py

import time
import streamlit as st
from scenario_generator import generate_case
from orchestrator import orchestrate

# ─── Page Config ──────────────────────────────────────────────────────────────
# ─── Secret Clue Reveal Box ───────────────────────────────────────────────────
def add_csi_reveal(secret_text):
    import streamlit.components.v1 as components
    components.html(f"""
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ background: transparent; }}
        .reveal-label {{
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.6rem;
            color: #D4AF37;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 5px;
        }}
        .reveal-box {{
            position: relative;
            width: 100%;
            height: 70px;
            background: #0a0a0a;
            overflow: hidden;
            border: 1px solid #2a2a2a;
            border-left: 3px solid #D4AF37;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: crosshair;
            border-radius: 2px;
        }}
        .hidden-text {{
            font-size: 0.8rem;
            color: #1e1e1e;
            font-family: 'IBM Plex Mono', monospace;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            user-select: none;
        }}
        .glow-text {{
            position: absolute;
            font-size: 0.8rem;
            color: #00F2FF;
            font-family: 'IBM Plex Mono', monospace;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            user-select: none;
            -webkit-mask-image: radial-gradient(circle 80px at var(--x, -999px) var(--y, -999px), black 20%, transparent 100%);
            mask-image: radial-gradient(circle 80px at var(--x, -999px) var(--y, -999px), black 20%, transparent 100%);
        }}
    </style>
    <div class="reveal-label">🔦 Secret Clue — hover to reveal</div>
    <div class="reveal-box" id="revealBox">
        <div class="hidden-text">[ CLASSIFIED EVIDENCE ]</div>
        <div class="glow-text" id="glowText">{secret_text}</div>
    </div>
    <script>
        const box = document.getElementById('revealBox');
        const glow = document.getElementById('glowText');
        box.addEventListener('mousemove', function(e) {{
            const rect = box.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            glow.style.setProperty('--x', x + 'px');
            glow.style.setProperty('--y', y + 'px');
        }});
        box.addEventListener('mouseleave', function() {{
            glow.style.setProperty('--x', '-999px');
            glow.style.setProperty('--y', '-999px');
        }});
    </script>
    """, height=100)


st.set_page_config(
    page_title="CSI Vegas",
    page_icon="🎰",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── Vegas Dark Theme CSS ──────────────────────────────────────────────────────
st.markdown("""
<style>
    /* Import fonts */
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=IBM+Plex+Mono:wght@400;500&display=swap');

    /* Global dark Vegas palette */
    :root {
        --gold: #D4AF37;
        --red: #C0392B;
        --cream: #F5F0E8;
        --dark: #0A0A0A;
        --dark-card: #111111;
        --dark-border: #2A2A2A;
        --neon-green: #39FF14;
    }

    /* Background */
    .stApp {
        background-color: var(--dark);
        background-image:
            radial-gradient(ellipse at top left, rgba(212,175,55,0.06) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(192,57,43,0.06) 0%, transparent 50%);
        font-family: 'IBM Plex Mono', monospace;
        color: var(--cream);
    }

    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #0D0D0D;
        border-right: 1px solid var(--dark-border);
    }

    /* Main title */
    h1, h2, h3 {
        font-family: 'Playfair Display', serif !important;
        color: var(--gold) !important;
        letter-spacing: 0.02em;
    }

    /* Chat messages */
    [data-testid="stChatMessage"] {
        background-color: var(--dark-card) !important;
        border: 1px solid var(--dark-border) !important;
        border-radius: 4px !important;
        margin-bottom: 8px !important;
    }

    /* Chat input */
    [data-testid="stChatInput"] textarea {
        background-color: #161616 !important;
        border: 1px solid var(--gold) !important;
        color: var(--cream) !important;
        font-family: 'IBM Plex Mono', monospace !important;
        border-radius: 2px !important;
    }

    /* Info box (case file) — kept for fallback */
    .stAlert {
        background-color: #161616 !important;
        border: 1px solid var(--gold) !important;
        border-left: 4px solid var(--gold) !important;
        color: var(--cream) !important;
        font-family: 'IBM Plex Mono', monospace !important;
        font-size: 0.85rem !important;
    }

    /* Buttons */
    .stButton > button {
        background-color: transparent !important;
        border: 1px solid var(--gold) !important;
        color: var(--gold) !important;
        font-family: 'IBM Plex Mono', monospace !important;
        letter-spacing: 0.1em !important;
        text-transform: uppercase !important;
        font-size: 0.75rem !important;
        transition: all 0.2s ease !important;
    }
    .stButton > button:hover {
        background-color: var(--gold) !important;
        color: var(--dark) !important;
    }

    /* Text input */
    .stTextInput input {
        background-color: #161616 !important;
        border: 1px solid var(--red) !important;
        color: var(--cream) !important;
        font-family: 'IBM Plex Mono', monospace !important;
    }

    /* Caption / small text */
    .stCaption, small {
        color: #666 !important;
        font-family: 'IBM Plex Mono', monospace !important;
    }

    /* Spinner */
    .stSpinner > div {
        border-top-color: var(--gold) !important;
    }

    /* Success / Error */
    .stSuccess {
        background-color: #0f1f0f !important;
        border: 1px solid var(--neon-green) !important;
        color: var(--neon-green) !important;
    }
    .stError {
        background-color: #1f0f0f !important;
        border: 1px solid var(--red) !important;
        color: #ff6b6b !important;
    }

    /* Metric (timer) */
    [data-testid="stMetric"] {
        background-color: #161616;
        border: 1px solid var(--dark-border);
        padding: 8px 12px;
        border-radius: 2px;
    }
    [data-testid="stMetricValue"] {
        color: var(--gold) !important;
        font-family: 'IBM Plex Mono', monospace !important;
        font-size: 1.4rem !important;
    }

    /* Divider */
    hr {
        border-color: var(--dark-border) !important;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--dark); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

    /* ── NEW: Parchment Case File card ── */
    .case-file-parchment {
        background: linear-gradient(135deg, #d0ba80 0%, #b89050 100%);
        border: 1px solid #8a6c3a;
        border-radius: 3px;
        padding: 16px;
        position: relative;
        box-shadow: 3px 3px 10px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.08);
        transform: rotate(0.3deg);
        margin-bottom: 16px;
    }
    .case-file-parchment::before {
        content: '';
        position: absolute;
        top: -6px; left: 50%;
        transform: translateX(-50%);
        width: 30px; height: 11px;
        background: #D4AF37;
        border-radius: 2px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }
    .case-file-parchment .cf-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.05rem;
        font-weight: 700;
        color: #2a1a08;
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 10px;
        border-bottom: 1px solid rgba(42,26,8,0.3);
        padding-bottom: 6px;
    }
    .case-file-parchment .cf-body {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.78rem;
        color: #2a1a08;
        line-height: 1.75;
    }

    /* ── NEW: Dossier cards (victim + suspects) ── */
    .dossier-victim-card {
        background: #111111;
        border: 1px solid #2A2A2A;
        border-radius: 4px;
        padding: 14px;
        margin-bottom: 12px;
        display: flex;
        gap: 14px;
        align-items: flex-start;
    }
    .dossier-photo {
        width: 72px; height: 82px;
        background: #0a0a0a;
        border: 2px solid #3a2a10;
        border-radius: 2px;
        display: flex; align-items: center; justify-content: center;
        font-size: 2.2rem;
        flex-shrink: 0;
    }
    .dossier-tag {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.62rem;
        color: #c8900a;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        margin-bottom: 2px;
    }
    .dossier-name {
        font-family: 'Playfair Display', serif;
        font-size: 1.05rem;
        font-weight: 700;
        color: #F5F0E8;
        line-height: 1.2;
    }
    .dossier-role {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.72rem;
        color: #c8900a;
        font-style: italic;
        margin-bottom: 6px;
    }
    .dossier-detail {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.68rem;
        color: #666;
        margin-top: 3px;
    }
    .dossier-detail b {
        color: #888;
        text-transform: uppercase;
        font-size: 0.6rem;
        letter-spacing: 0.1em;
    }

    .dossier-suspects-header {
        font-family: 'Playfair Display', serif;
        font-size: 1rem;
        color: var(--gold);
        margin-bottom: 10px;
        border-bottom: 1px solid #2A2A2A;
        padding-bottom: 6px;
    }
    .dossier-suspect-card {
        background: #0d0d0d;
        border: 1px solid #1e1e1e;
        border-radius: 3px;
        padding: 10px;
        margin-bottom: 8px;
        display: flex;
        gap: 10px;
        align-items: flex-start;
    }
    .dossier-suspect-photo {
        width: 58px; height: 68px;
        background: #0a0a0a;
        border: 2px solid #2a2a2a;
        border-radius: 2px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.8rem;
        flex-shrink: 0;
    }
    .dossier-suspect-name {
        font-family: 'Playfair Display', serif;
        font-size: 0.92rem;
        font-weight: 700;
        color: #F5F0E8;
        line-height: 1.2;
    }
    .dossier-suspect-detail {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.68rem;
        color: #555;
        margin-top: 3px;
        line-height: 1.4;
    }
    .dossier-suspect-tip {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 0.65rem;
        color: #c8900a;
        font-style: italic;
        margin-top: 5px;
        padding-top: 5px;
        border-top: 1px dashed #222;
    }
</style>
""", unsafe_allow_html=True)

# ─── Game Constants ────────────────────────────────────────────────────────────
GAME_DURATION_SECONDS = 30 * 60  # 30 minutes

# ─── Initialize Session State ─────────────────────────────────────────────────
if "case" not in st.session_state:
    with st.spinner("🎰 Shuffling the deck... generating your Vegas crime..."):
        st.session_state.case = generate_case()
    st.session_state.case_file = (
        f"A body was discovered at the Bellagio. "
        f"Victim: {st.session_state.case['victim']['name']}, "
        f"a {st.session_state.case['victim']['role']}. "
        "Investigation begins."
    )
    st.session_state.history = []
    st.session_state.start_time = time.time()
    st.session_state.game_over = False
    st.session_state.show_solve = False
    st.session_state.solved = None

# ─── Sidebar — Timer + Controls only ──────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🎰 CSI Vegas")
    st.markdown("---")

    # ─── Countdown Timer ───────────────────────────────────────────────────────
    st.markdown("**⏱ Time Remaining**")
    elapsed = time.time() - st.session_state.start_time
remaining = max(0, GAME_DURATION_SECONDS - elapsed)
mins = int(remaining // 60)
secs = int(remaining % 60)
st.metric(label="", value=f"{mins:02d}:{secs:02d}")

if remaining == 0 and not st.session_state.game_over:
    st.session_state.game_over = True

# ← This is the only change needed
if not st.session_state.game_over and st.session_state.solved is None:
    time.sleep(1)
    st.rerun()

    st.markdown("---")
    st.markdown("**📍 Location**")
    st.markdown("`The Bellagio, Las Vegas Strip`")
    st.markdown("---")
    st.caption("Interrogate witnesses. Submit clues. Solve the case.")
    st.caption("Tip: Start messages with 'ask', 'found', or 'analyze' to route correctly.")

    if st.button("🔄 New Case"):
        st.session_state.clear()
        st.rerun()

# ─── Main Layout ──────────────────────────────────────────────────────────────
st.markdown("# CSI VEGAS")
st.caption("A multi-agent AI murder mystery — interrogate, analyze, deduce.")
st.markdown("---")

c = st.session_state.case
col1, col2 = st.columns([3, 2])

# ─── Left Column: Chat Interface ──────────────────────────────────────────────
with col1:
    st.markdown("### 🎙 Investigation Room")

    for msg in st.session_state.history:
        with st.chat_message(msg["role"]):
            if msg["role"] == "assistant" and "agent" in msg:
                st.caption(f"— {msg['agent']} Agent")
            st.write(msg["content"])

    if not st.session_state.game_over and st.session_state.solved is None:
        if prompt := st.chat_input("Ask a witness, submit evidence, or describe a scene..."):
            st.session_state.history.append({"role": "user", "content": prompt})

            with st.spinner("🔍 Agents at work..."):
                result = orchestrate(
                    prompt,
                    st.session_state.case,
                    st.session_state.case_file,
                    str(st.session_state.history[-10:])
                )

            st.session_state.case_file = result["updated_case_file"]
            st.session_state.history.append({
                "role": "assistant",
                "content": result["response"],
                "agent": result["agent"]
            })
            st.rerun()
    else:
        if st.session_state.game_over and st.session_state.solved is None:
            st.error("⏰ Investigation closed. Time expired.")

# ─── Right Column: Dossier + Case File + Accusation ───────────────────────────
with col2:

    # ── NEW: Victim dossier card ───────────────────────────────────────────────
    st.markdown(f"""
    <div class="dossier-victim-card">
        <div class="dossier-photo">🕵️</div>
        <div>
            <div class="dossier-tag">Victim</div>
            <div class="dossier-name">{c['victim']['name']}</div>
            <div class="dossier-role">{c['victim']['role']}</div>
            <div class="dossier-detail"><b>Details</b> {c['victim']['name']}</div>
            <div class="dossier-detail"><b>Evidence</b> 🔍 Fingerprint on file</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ── NEW: Suspects dossier cards ────────────────────────────────────────────
    icons  = ["🧑‍💼", "🕴️"]
    badges = ["🃏", "🦈"]
    suspects_html = '<div style="margin-bottom:16px"><div class="dossier-suspects-header">Suspects</div>'
    for sus_key, icon, badge in zip(["suspect_a", "suspect_b"], icons, badges):
        sus = c[sus_key]
        suspects_html += f"""
        <div class="dossier-suspect-card">
            <div class="dossier-suspect-photo">{icon}</div>
            <div>
                <div class="dossier-suspect-name">{sus['name']}</div>
                <div class="dossier-suspect-detail">Motive: {sus['motive'][:60]}</div>
                <div class="dossier-suspect-detail">Alibi: {sus['alibi'][:60]}</div>
                <div class="dossier-suspect-tip">{badge} Start msgs with "ask", "found" or "analyze"</div>
            </div>
        </div>"""
    suspects_html += '</div>'
    st.markdown(suspects_html, unsafe_allow_html=True)

    # ── NEW: Parchment Case File ───────────────────────────────────────────────
    case_text = st.session_state.case_file.replace("\n", "<br>")
    st.markdown(f"""
    <div class="case-file-parchment">
        <div class="cf-title">🔑 Live Case File</div>
        <div class="cf-body">{case_text}</div>
    </div>
    """, unsafe_allow_html=True)

    # ── Secret Clue Reveal Box ────────────────────────────────────────────────
    add_csi_reveal(c['key_clue'].upper())

    # ── Accusation (unchanged) ─────────────────────────────────────────────────
    st.markdown("### 🔫 Make Your Accusation")

    if st.session_state.solved is None:
        if st.button("I know the culprit — make an accusation"):
            st.session_state.show_solve = True

        if st.session_state.get("show_solve"):
            suspects = [c["suspect_a"]["name"], c["suspect_b"]["name"]]
            guess = st.selectbox("Select the culprit:", ["— choose —"] + suspects)

            if st.button("Submit Accusation"):
                if guess == "— choose —":
                    st.warning("Select a suspect first.")
                else:
                    culprit = st.session_state.case["culprit"]
                    if guess.lower() in culprit.lower() or culprit.lower() in guess.lower():
                        st.session_state.solved = True
                        st.balloons()
                    else:
                        st.session_state.solved = False
                    st.rerun()

    elif st.session_state.solved is True:
        culprit = st.session_state.case["culprit"]
        weapon  = st.session_state.case["murder_weapon"]
        clue    = st.session_state.case["key_clue"]
        st.success(f"✅ Case closed! {culprit} did it.")
        st.markdown(f"**Weapon:** {weapon}")
        st.markdown(f"**Key clue:** {clue}")
        if st.button("Play Again"):
            st.session_state.clear()
            st.rerun()

    elif st.session_state.solved is False:
        culprit = st.session_state.case["culprit"]
        st.error(f"❌ Wrong. The culprit was **{culprit}**.")
        if st.button("Play Again"):
            st.session_state.clear()
            st.rerun()

    st.markdown("---")
    st.markdown("### 🤫 What happens in the investigation room?")
    st.markdown("""
**1. 👤 THE WITNESS AGENT** 
> Ask the suspects about their location, motives, or secrets.  
↳ *Example: "Leo, why were you near the vault at 3 AM?"* *(The Witness might lie—it's your job to catch them.)*

**2. 💻 THE ANALYST AGENT** 
> Submit clues or ask for a logic check on a suspect's story.
↳ *Example: "Does the security log match Sasha's alibi?"* *(The Analyst will flag contradictions in RED if they find a lie.)*

**3. 🎙️ THE NARRATOR AGENT** 
> Interact with the room or get a summary of your progress.  
↳ *Example: "Search the victim's pockets" or "Give me a case recap."* *(The Narrator evolves the story based on your discoveries.)*
    """)