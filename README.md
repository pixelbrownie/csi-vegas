# CSI Vegas 🎰🔍

A multi-agent AI murder mystery game set in Las Vegas. Interrogate suspects, analyze clues, and solve the case before time runs out.

---

## How It Works

The game uses three specialized AI agents, each routed automatically based on what you type:

| Agent | Trigger | Role |
|---|---|---|
| 🕵️ Witness Agent | Questions about suspects, alibis, whereabouts | Plays a nervous suspect — drops hints without confessing |
| 🔬 Analyst Agent | Clue submission, forensic analysis | Cross-checks evidence and flags contradictions |
| 🎙️ Narrator Agent | Story observations, anything else | Updates the live case file in noir style |

A new crime scenario is generated each game (victim, two suspects, culprit, weapon, key clue). You have 30 minutes to interrogate, gather evidence, and make your accusation.

---

## Project Structure

```
csi-vegas/
├── backend/
│   ├── main.py               # FastAPI server
│   ├── llm_client.py         # Groq (OpenAI-compatible) chat client
│   ├── orchestrator.py       # Intent classification + agent routing
│   ├── agents.py             # Witness, Analyst, Narrator agents
│   └── scenario_generator.py # Crime scenario generator (Groq or offline)
└── frontend/
    ├── src/
    │   ├── app.jsx            # Root component, game state, API calls
    │   ├── main.jsx           # React entry point
    │   ├── style_fixed.css    # Global styles and CSS variables
    │   └── components/
    │       ├── GamePage.jsx       # 4-column game layout
    │       ├── LandingPage.jsx    # Hero + agent explainer
    │       ├── ChatRoom.jsx       # Chat UI with agent-styled bubbles
    │       ├── DossierPanel.jsx   # Victim + suspect cards
    │       ├── RightPanel.jsx     # Case file, accusation, how-to-play
    │       ├── Sidebar.jsx        # Timer + location + new case
    │       └── SecretReveal.jsx   # Hover-to-reveal secret clue widget
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** and npm

**Live AI (Groq):** Set `GROQ_API_KEY` on the server. Every new case, agent reply, and router decision then goes through [Groq’s OpenAI-compatible API](https://console.groq.com/docs/openai) using `GROQ_MODEL` (default `llama-3.3-70b-versatile`). If your Groq account lists a Mistral-family model, set `GROQ_MODEL` to that id. With no key, the backend uses offline scripted scenarios and templates.

---

## Backend Setup

### 1. Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. (Production) Environment variables — Render

On your Render web service, set at least:

| Variable | Example | Purpose |
|---|---|---|
| `GROQ_API_KEY` | `gsk_...` | Required for live scenarios and agents |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Model id from [Groq models](https://console.groq.com/docs/models) |
| `CORS_ORIGINS` | `https://pixelbrownie.github.io` | Extra allowed origin if needed (repo already allows `*.github.io`) |

Optional tuning: `GROQ_TEMPERATURE`, `GROQ_MAX_TOKENS`, `GROQ_TIMEOUT_S`, `GROQ_RETRIES`.

### 3. Start the backend

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. 

**Available endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/new-case` | Generate a new crime scenario |
| `POST` | `/chat` | Send a detective message, receive agent response |

---

## Frontend Setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure the API URL

Optional: create `frontend/.env` if your API is not on the default:

```env
VITE_API_URL=http://localhost:8000
```

If you omit it, the dev app uses `http://localhost:8000` (see `src/app.jsx`).

For a production build, set `VITE_API_URL` to wherever the FastAPI app is hosted (and add that origin to backend `CORS_ORIGINS` if needed).

### 3. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | _(none)_ | If set, all scenario + chat + routing use Groq |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Chat completions model id |
| `GROQ_BASE_URL` | `https://api.groq.com/openai/v1` | Override only if Groq changes the base URL |
| `CORS_ORIGINS` | _(none)_ | Comma-separated list of additional allowed origins (e.g. your deployed frontend URL) |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` (in code / `.env.production` template) | Backend API base URL baked in at build time |

---

## Deployment

### GitHub Pages (this repo → e.g. `https://pixelbrownie.github.io/csi-vegas/`)

1. In the GitHub repo, add a secret **`VITE_API_URL`** with your **Render API root** (no trailing slash), e.g. `https://csi-vegas-api.onrender.com`.
2. Push to `main`; the workflow builds with that URL baked into the static assets (`base` is already `/csi-vegas/` in `vite.config.js`).

### Render (FastAPI backend)

Use root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set **`GROQ_API_KEY`** (and optionally **`GROQ_MODEL`**) so the live site does not fall back to offline content.

### Self-hosted

Run FastAPI with uvicorn (`--host 0.0.0.0` and the port your host expects). Set `CORS_ORIGINS` if your frontend origin is not covered by `backend/main.py`.

---

## How to Play

1. Click **Start Investigation** on the landing page — a new case loads automatically.
2. Read the **Dossier** (left panel) for victim and suspect details.
3. Chat with the agents using natural language:
   - **Ask about suspects:** `"Where were you when Marco died?"`
   - **Submit evidence:** `"I found a loyalty card near the body. Analyze it."`
   - **Advance the story:** `"Search the victim's pockets."`
4. Watch the **Live Case File** (right panel) update as clues accumulate.
5. Hover over the **Secret Clue** panel to reveal the hidden evidence.
6. When ready, click **I Know the Culprit** and make your accusation.
7. You have **30 minutes** — the timer is in the left sidebar.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Framer Motion |
| Backend | FastAPI, Python 3.9+ |
| AI / LLM | Groq (OpenAI-compatible chat) when `GROQ_API_KEY` is set; offline templates otherwise |
| Styling | CSS custom properties, Google Fonts |
| Deployment | GitHub Pages workflow + any FastAPI host |

---

## Troubleshooting

**CORS errors in the browser**
Make sure your frontend origin is listed in `CORS_ORIGINS` on the backend, or matches the `allow_origin_regex` pattern (`*.github.io`).

**"Backend not reachable" in the game**
Check that the backend is running and `VITE_API_URL` points to the correct address. Visit `<your-api-url>/health` to verify.

**Blank game page / loading forever**
Open the browser console and check for API errors. Confirm the `/new-case` endpoint returns a valid response at your configured `VITE_API_URL`.
