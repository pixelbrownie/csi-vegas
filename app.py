# app.py
# Phase 4 & 5 — Streamlit UI with Vegas dark theme + countdown timer
# Run with: streamlit run app.py

import time
import streamlit as st
from scenario_generator import generate_case
from orchestrator import orchestrate

# ─── Page Config ──────────────────────────────────────────────────────────────
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

    /* Info box (case file) */
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

# ─── Sidebar — Case Dossier ────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🎰 Active Dossier")
    st.markdown("---")

    c = st.session_state.case
    st.markdown(f"**Victim**")
    st.markdown(f"`{c['victim']['name']}` — {c['victim']['role']}")
    st.markdown("---")
    st.markdown("**Suspects**")
    st.markdown(f"🔴 `{c['suspect_a']['name']}`")
    st.markdown(f"🔴 `{c['suspect_b']['name']}`")
    st.markdown("---")
    st.markdown("**Location**")
    st.markdown("`The Bellagio, Las Vegas Strip`")
    st.markdown("---")

    # ─── Countdown Timer ───────────────────────────────────────────────────────
    st.markdown("**⏱ Time Remaining**")
    elapsed = time.time() - st.session_state.start_time
    remaining = max(0, GAME_DURATION_SECONDS - elapsed)
    mins = int(remaining // 60)
    secs = int(remaining % 60)
    timer_color = "🟢" if remaining > 600 else ("🟡" if remaining > 180 else "🔴")
    st.metric(label="", value=f"{mins:02d}:{secs:02d}")

    if remaining == 0 and not st.session_state.game_over:
        st.session_state.game_over = True
        st.error("⏰ Time's up! The case goes cold.")

    st.markdown("---")
    st.caption("Interrogate witnesses. Submit clues. Solve the case.")
    st.caption("Tip: Start messages with 'ask', 'found', or 'analyze' to route correctly.")

    # Reset button
    if st.button("🔄 New Case"):
        for key in list(st.session_state.keys()):
            del st.session_state[key]
        st.rerun()

# ─── Main Layout ──────────────────────────────────────────────────────────────
st.markdown("# CSI VEGAS")
st.caption("A multi-agent AI murder mystery — interrogate, analyze, deduce.")
st.markdown("---")

col1, col2 = st.columns([3, 2])

# ─── Left Column: Chat Interface ──────────────────────────────────────────────
with col1:
    st.markdown("### 🎙 Investigation Room")

    # Render chat history
    for msg in st.session_state.history:
        with st.chat_message(msg["role"]):
            if msg["role"] == "assistant" and "agent" in msg:
                st.caption(f"— {msg['agent']} Agent")
            st.write(msg["content"])

    # Chat input (disabled if game over)
    if not st.session_state.game_over and st.session_state.solved is None:
        if prompt := st.chat_input("Ask a witness, submit evidence, or describe a scene..."):
            # Add user message
            st.session_state.history.append({"role": "user", "content": prompt})

            # Call orchestrator
            with st.spinner("🔍 Agents at work..."):
                result = orchestrate(
                    prompt,
                    st.session_state.case,
                    st.session_state.case_file,
                    str(st.session_state.history[-10:])  # last 10 messages for context
                )

            # Update case file from narrator
            st.session_state.case_file = result["updated_case_file"]

            # Add assistant message
            st.session_state.history.append({
                "role": "assistant",
                "content": result["response"],
                "agent": result["agent"]
            })
            st.rerun()
    else:
        if st.session_state.game_over and st.session_state.solved is None:
            st.error("⏰ Investigation closed. Time expired.")

# ─── Right Column: Case File + Solve Panel ────────────────────────────────────
with col2:
    st.markdown("### 📁 Live Case File")
    st.info(st.session_state.case_file)

    st.markdown("---")
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
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

    elif st.session_state.solved is False:
        culprit = st.session_state.case["culprit"]
        st.error(f"❌ Wrong. The culprit was **{culprit}**.")
        if st.button("Play Again"):
            for key in list(st.session_state.keys()):
                del st.session_state[key]
            st.rerun()

    st.markdown("---")
    st.markdown("### 💡 How to Play")
    st.markdown("""
**Witness Agent** — Question suspects  
↳ *"Where were you when Marco died?"*

**Analyst Agent** — Submit clues  
↳ *"I found a loyalty card. Analyze it."*

**Narrator Agent** — Advance the story  
↳ *Anything else you type*
    """)