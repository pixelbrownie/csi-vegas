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
│   ├── main.py
│   ├── llm_client.py
│   ├── orchestrator.py
│   ├── agents.py
│   ├── scenario_generator.py
│   └── requirements.txt
├── frontend/
│   ├── src/ 
│   │   ├── app.jsx            # Root component, game state, API calls
│   │   ├── main.jsx           # React entry point
│   │   ├── style_fixed.css    # Global styles and CSS variables
│   │   └── components/
│   │       ├── GamePage.jsx       # 4-column game layout
│   │       ├── LandingPage.jsx    # Hero + agent explainer
│   │       ├── ChatRoom.jsx       # Chat UI with agent-styled bubbles
│   │       ├── DossierPanel.jsx   # Victim + suspect cards
│   │       ├── RightPanel.jsx     # Case file, accusation, how-to-play
│   │       ├── Sidebar.jsx        # Timer + location + new case
│   │       └── SecretReveal.jsx   # Hover-to-reveal secret clue widget
│   ├── index.html
│   └── vite.config.js
└── README.md
```

---

## Prerequisites

- **Python 3.9+**
- **Node.js 18+** and npm

**Live AI (Groq):** Set `GROQ_API_KEY` on the server. Every new case, agent reply, and router decision then goes through [Groq’s OpenAI-compatible API](https://console.groq.com/docs/openai) using `GROQ_MODEL` (default `llama-3.3-70b-versatile`). If your Groq account lists a Mistral-family model, set `GROQ_MODEL` to that id. With **no** key, the backend uses offline scripted scenarios and templates. If a key **is** set but Groq returns errors (for example Cloudflare **403 / error 1010** from datacenter IPs), the server uses a **browser-like `User-Agent`**, retries, then **falls back to the same offline scripts** so the game UI still loads and chat still works.

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
| _(CORS)_ | _(none)_ | API allows all origins (`Access-Control-Allow-Origin: *`) for simple browser access from any static host |

Optional tuning: `GROQ_TEMPERATURE`, `GROQ_MAX_TOKENS`, `GROQ_TIMEOUT_S`, `GROQ_RETRIES`, `GROQ_USER_AGENT` (override only if Groq/Cloudflare still blocks your host).

### 3. Start the backend

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. 

**Available endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/wake` | Lightweight “spin up the host” ping (no case generation) |
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

For a production build, set `VITE_API_URL` to wherever the FastAPI app is hosted.

**GitHub Pages:** the workflow writes `frontend/public/api-config.json` from the `VITE_API_URL` secret (or a default Render URL). The app also reads that file at runtime if `VITE_API_URL` was not baked in, so forks can edit `api-config.json` and redeploy without secrets.

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
| `GROQ_USER_AGENT` | _(default: Chrome-like string)_ | Sent on Groq HTTP requests; helps avoid Cloudflare **403 / 1010** blocks |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://csi-vegas.onrender.com` (template / fallback) | Backend API base URL baked in at build time |

---

## Deployment

### GitHub Pages (this repo → e.g. `https://pixelbrownie.github.io/csi-vegas/`)

1. In the GitHub repo, add a secret **`VITE_API_URL`** with your **Render API root** (no trailing slash), e.g. `https://csi-vegas-api.onrender.com`.
2. Push to `main`; the workflow builds with that URL baked into the static assets (`base` is already `/csi-vegas/` in `vite.config.js`).

### Render (FastAPI backend)

Use root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set **`GROQ_API_KEY`** (and optionally **`GROQ_MODEL`**) so the live site does not fall back to offline content.

### Self-hosted

Run FastAPI with uvicorn (`--host 0.0.0.0` and the port your host expects).

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
The API is configured to allow any origin. If you still see CORS errors, confirm the browser is actually talking to your FastAPI app (correct `VITE_API_URL` / `api-config.json`) and that no corporate extension is blocking requests.

**"Backend not reachable" in the game**
Check that the backend is running and `VITE_API_URL` points to the correct address. Visit `<your-api-url>/health` to verify.

**Blank game page / loading forever**
Open the browser console and check for API errors. Confirm the `/new-case` endpoint returns a valid response at your configured `VITE_API_URL`.

**Groq `403` / `error code: 1010` in the error text**
That response is from **Groq (Cloudflare)**, not your React app. Ensure `GROQ_API_KEY` is valid and the model id exists for your account. After deploying the latest backend, requests include a normal `User-Agent` and retries on 403. If it still fails, remove `GROQ_API_KEY` on Render to run **fully offline**, or contact Groq support with the `cf-ray` id from the error response.
