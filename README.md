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
│   ├── orchestrator.py       # Intent classification + agent routing
│   ├── agents.py             # Witness, Analyst, Narrator agents
│   └── scenario_generator.py # Random crime scenario generator
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
- **Ollama** (optional — the app works without it using randomized fallback cases)

---

## Backend Setup

### 1. Install Python dependencies

```bash
cd backend
pip install fastapi uvicorn langchain-community pydantic
```

### 2. (Optional) Set up Ollama for AI-generated content

If you want live LLM responses instead of fallback content, install [Ollama](https://ollama.ai) and pull the Mistral model:

```bash
ollama pull mistral
ollama serve   # starts on http://localhost:11434 by default
```

> Without Ollama running, the app automatically falls back to randomized hardcoded scenarios and scripted agent responses — the game is fully playable either way.

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

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

For production (e.g. Render backend + GitHub Pages frontend):

```env
VITE_API_URL=https://csi-vegas.onrender.com
```

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
| `CORS_ORIGINS` | _(none)_ | Comma-separated list of additional allowed origins (e.g. your deployed frontend URL) |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://csi-vegas.onrender.com` | Backend API base URL |

---

## Deployment

### Backend — Render (recommended)

1. Push the `backend/` folder to a GitHub repo.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set the build command to `pip install -r requirements.txt` and start command to `uvicorn main:app --host 0.0.0.0 --port 10000`.
4. Add `CORS_ORIGINS=https://<your-github-username>.github.io` as an environment variable.

### Frontend — GitHub Pages

1. In `frontend/package.json`, add:
   ```json
   "homepage": "https://<your-username>.github.io/<repo-name>"
   ```
2. Install the deploy tool:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add to `package.json` scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. Set `VITE_API_URL` to your Render backend URL in a `.env.production` file, then run:
   ```bash
   npm run deploy
   ```

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
| AI / LLM | LangChain + Ollama (Mistral) |
| Styling | CSS custom properties, Google Fonts |
| Deployment | GitHub Pages (frontend), Render (backend) |

---

## Troubleshooting

**CORS errors in the browser**
Make sure your frontend origin is listed in `CORS_ORIGINS` on the backend, or matches the `allow_origin_regex` pattern (`*.github.io`).

**"Backend not reachable" in the game**
Check that the backend is running and `VITE_API_URL` points to the correct address. Visit `<your-api-url>/health` to verify.

**Ollama not responding**
The app will silently fall back to randomized hardcoded cases. Restart with `ollama serve` and refresh the page for a new case if you want live LLM output.

**Blank game page / loading forever**
Open the browser console and check for API errors. Confirm the `/new-case` endpoint returns a valid response at your configured `VITE_API_URL`.
