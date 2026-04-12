# CSI Vegas 🎰🔍

A sophisticated multi-agent AI murder mystery game set in Las Vegas. Interrogate suspects, analyze forensic evidence, detect contradictions, and solve cases before time runs out.

---

## 🎯 **New Features Showcase**

### **🤖 Advanced Multi-Agent System**
- **🕵️ Witness Agent**: Interactive suspect interrogation with personality-driven responses
- **🔬 Analyst Agent**: Professional forensic evidence processing and analysis  
- **🎙️ Narrator Agent**: Atmospheric noir storytelling and case progression
- **🔍 Auditor Agent**: Real-time contradiction detection and lie identification

### **🧠 Intelligent Features**
- **🔄 Self-Correction Loops**: Suspects adjust stories when caught in contradictions
- **🎭 Dynamic Persona Consistency**: Each agent maintains distinct voice and behavior
- **📊 Evidence Importance Grading**: LOW/MEDIUM/HIGH priority classification
- **⚡ Live LLM Integration**: Groq-powered responses with graceful fallback
- **🗄️ RAG Memory System**: Vector-based context retrieval across interactions

### **🎮 Enhanced Gameplay**
- **[! ] Contradiction Alerts**: Visual indicators when suspects lie
- **🔍 Forensic Analysis**: Detailed evidence breakdown with reasoning traces
- **📋 Live Case File**: Real-time narrative updates
- **⏱️ 30-Minute Timer**: Pressure-filled investigation experience
- **🎯 Smart Accusation System**: Case resolution with feedback

---

## How It Works

The game uses **four specialized AI agents**, each routed automatically based on your input:

| Agent | Trigger | Role | Advanced Features |
|---|---|---|---|
| 🕵️ Witness Agent | Questions about suspects, alibis, whereabouts | Personality-driven responses + contradiction detection + self-correction |
| 🔬 Analyst Agent | Clue submission, forensic analysis | Evidence grading + RAG memory integration + importance classification |
| 🎙️ Narrator Agent | Story observations, anything else | Atmospheric updates + case file management |
| 🔍 Auditor Agent | All witness responses | Real-time lie detection + contradiction explanations |

**Dual-layer routing**: Intelligent intent classification with keyword fallback ensures reliable agent selection.

**Dynamic case generation**: Each game creates unique scenarios with victim, suspects, culprit, weapon, and key clue.

---

## 🏗️ **Technical Architecture**

### **Backend Orchestration**
```
User Input → Intent Classification → Agent Selection → Response Generation → Audit → Memory Storage
```

**Key Components:**
- **Orchestrator**: Intelligent routing with dual-layer classification
- **Agent System**: Four specialized agents with consistent personas
- **Memory Layer**: ChromaDB vector store for semantic retrieval
- **Audit System**: Real-time contradiction detection and validation
- **LLM Client**: Groq integration with retry logic and fallback

### **Frontend Architecture**
- **React + Vite**: Modern SPA with component-based design
- **Real-time Updates**: Live chat with animated indicators
- **Responsive UI**: Mobile-friendly investigation interface
- **State Management**: Centralized game state with error handling

---

## Project Structure

```
csi-vegas/
├── backend/
│   ├── main.py                 # FastAPI server with REST endpoints
│   ├── llm_client.py          # Groq integration with retry logic
│   ├── orchestrator.py         # Intent classification and routing
│   ├── agents.py              # Four specialized AI agents
│   ├── scenario_generator.py   # Dynamic case generation
│   ├── memory.py              # ChromaDB vector storage
│   └── requirements.txt
├── frontend/
│   ├── src/ 
│   │   ├── app.jsx            # Root component, game state, API calls
│   │   ├── main.jsx           # React entry point
│   │   ├── style_fixed.css    # Global styles and CSS variables
│   │   └── components/
│   │       ├── GamePage.jsx       # 4-column game layout
│   │       ├── LandingPage.jsx    # Hero + feature showcase
│   │       ├── ChatRoom.jsx       # Chat UI with contradiction alerts
│   │       ├── DossierPanel.jsx   # Victim + suspect cards
│   │       ├── RightPanel.jsx     # Case file, accusation, timer
│   │       ├── Sidebar.jsx        # Game controls + navigation
│   │       └── SecretReveal.jsx   # Evidence reveal widget
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

## 🛠️ Technical Implementation Stack

| Category | Implemented Technology | Implementation Location | Description |
| :--- | :--- | :--- | :--- |
| **LLMs (Free Tier)** | **Groq (Llama 3.3)** | [`backend/llm_client.py`](./backend/llm_client.py) | High-speed inference for Noir dialogue and reasoning. |
| **Frameworks** | **LangChain** | [`backend/agents.py`](./backend/agents.py) | Structured messaging for multi-turn investigations. |
| **Embeddings** | **Sentence-Transformers** | [`backend/memory.py`](./backend/memory.py) | Semantic mapping of evidence and alibis. |
| **Vector Databases** | **ChromaDB** | [`backend/memory.py`](./backend/memory.py) | Efficient lookup of long-term "digital forensic" records. |
| **RAG Systems** | **Vector Store Retrievers** | [`backend/agents.py`](./backend/agents.py) | Cross-referencing current questions with past turns. |
| **Agent Frameworks** | **Multi-Agent Orchestrator** | [`backend/orchestrator.py`](./backend/orchestrator.py) | Intelligent classification and routing of player intent. |
| **Backend** | **Python (FastAPI)** | [`backend/main.py`](./backend/main.py) | REST API endpoints for secure frontend-to-AI communication. |
| **Frontend** | **React + CSS Tokens** | [`frontend/src/`](./frontend/src/) | Custom "Sin City" design system with rounded manila folders. |

---

## 🎯 **Sample Gameplay Flow**

```text
DETECTIVE: Where were you during the murder?

🕵️ Witness: [Adjusts tie nervously] I was at the poker tournament all night.

[! ] DISCREPANCY DETECTED
FORENSIC AUDIT: Witness claims to be at tournament all night, but security shows 30-minute gap.

DETECTIVE: Security shows you left for 30 minutes. Explain that.

🕵️ Witness: [CONTRADICTION DETECTED] I only stepped outside for a phone call about my daughter!

DETECTIVE: Analyze the torn fabric found at the scene.

🔬 Analyst: Fabric matches designer gown material. 99.8% match to suspect's dress. Importance: HIGH.

DETECTIVE: I accuse Lola Luxe of the murder!

🎙️ Narrator: The final card is played. Justice comes calling in Vegas.
```

---

## 🌐 **Deployment Options**

### **Development**
- **Backend**: `uvicorn main:app --reload --port 8000`
- **Frontend**: `npm run dev` → `http://localhost:5173`

### **Production - Render**
1. Deploy backend to Render with `GROQ_API_KEY` environment variable
2. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Configure CORS for frontend access

### **Production - GitHub Pages**
1. Set `VITE_API_URL` secret in GitHub repo
2. Auto-deploy on push to main branch
3. Static hosting with API configuration

### **Self-Hosted**
- Docker containerization available
- Environment variables for all configurations
- Scalable deployment options

---

## 🔍 **Troubleshooting**

**CORS errors in the browser**
The API is configured to allow any origin. If you still see CORS errors, confirm the browser is actually talking to your FastAPI app (correct `VITE_API_URL` / `api-config.json`) and that no corporate extension is blocking requests.

**"Backend not reachable" in the game**
Check that the backend is running and `VITE_API_URL` points to the correct address. Visit `<your-api-url>/health` to verify.

**Blank game page / loading forever**
Open the browser console and check for API errors. Confirm the `/new-case` endpoint returns a valid response at your configured `VITE_API_URL`.

**Groq `403` / `error code: 1010` in the error text**
That response is from **Groq (Cloudflare)**, not your React app. Ensure `GROQ_API_KEY` is valid and the model id exists for your account. After deploying the latest backend, requests include a normal `User-Agent` and retries on 403. If it still fails, remove `GROQ_API_KEY` on Render to run **fully offline**, or contact Groq support with the `cf-ray` id from the error response.

---

## 🎖️ **Advanced Features**

### **Intelligence Layer**
- **Semantic Memory**: Cross-references evidence across entire investigation
- **Contradiction Detection**: Real-time lie identification with explanations
- **Evidence Grading**: Automatic importance classification (LOW/MEDIUM/HIGH)
- **Persona Consistency**: Each agent maintains character voice throughout

### **User Experience**
- **Animated Feedback**: Visual indicators for system status
- **Reasoning Traces**: Transparent AI decision-making process
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Progressive Disclosure**: Evidence revealed through investigation

### **Technical Excellence**
- **Graceful Degradation**: Works offline without API keys
- **Error Recovery**: Automatic retry and fallback mechanisms
- **Performance Optimized**: Efficient vector search and caching
- **Scalable Architecture**: Easy to add new agents and features

---

## 📞 **Support & Contributing**

### **Getting Help**
- Check this README for common issues
- Review browser console for error details
- Verify backend logs for API problems

### **Contributing**
1. Fork repository
2. Create feature branch
3. Test thoroughly with both online and offline modes
4. Submit pull request with detailed description

### **Feature Requests**
- New agent types welcome
- Additional evidence types supported
- UI/UX improvements encouraged
- Performance optimizations appreciated

---

**CSI Vegas** - Where every case tells a story, and every story has a killer to catch. 🎰🔍
