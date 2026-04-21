# 🎰 CSI Vegas: Murder Mystery Game 🕵️‍♂️

**CSI Vegas** is a multi-agent AI experience that plunges you into the neon shadows of a high-stakes Las Vegas crime scene. 
For this AI/ML project, I wanted to build more than just a chatbot, this is a dive in the **Agentic Ecosystem**. I have built a game where you play the detective, navigating a murder mystery hidden behind the golden lights of the Bellagio

Live at : https://pixelbrownie.github.io/csi-vegas/
-----

## 🎭 The Experience

You have **30 minutes** to crack a procedurally generated murder at the Bellagio.

  * **Scan the Dossier**: Deep-dive into victim profiles and suspect backgrounds.
  * **Agentic Interrogation**: Question suspects who use defensive reasoning to protect their "Secret Truths."
  * **Forensic Verification**: Use Agent Reyes to process fingerprints and toxicology via RAG-driven analysis.
  * **The Audit**: Utilize the **Forensic Auditor**—a hidden LLM layer that peer-reviews suspect statements to flag lies.

## 🏆 Highlights

  * **Agentic Oversight:** We don't just trust the AI; we use the **Auditor Agent** to verify Witness statements, preventing hallucinations and ensuring game integrity.
  * **Hybrid Routing:** Combines high-speed keyword classification with LLM intent analysis for 0-latency gameplay.
  * **Responsive Noir UI:** A custom-built CSS token system designed to match the "Sin City" theme of HackNite 2026.

## 🧠 Agentic Architecture

This project implements a **Hierarchical Multi-Agent System** using LangChain and Gemini 2.0 Flash:

| Agent | Role | Technical Implementation |
| :--- | :--- | :--- |
| **The Orchestrator** | **Traffic Controller** | Intent-classification logic that routes queries to the correct expert. |
| **The Witness** | **The Suspect** | Persona-driven LLM with "Secret Truth" injection and defensive prompting. |
| **Agent Reyes** | **Forensic Analyst** | RAG-based retrieval from a vector evidence store with importance grading. |
| **The Auditor** | **Lie Detector** | A specialized agent that audits Witness responses against the "Ground Truth" JSON. |
| **The Narrator** | **The Vibe** | Atmospheric Noir updates using stylized cinematic prompting. |

-----

## 🛠️ **Tech Stack**

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **LLM Engine** | **Gemini 2.0 Flash** | High-speed inference with advanced reasoning capabilities. |
| **Backend** | **FastAPI (Python)** | Asynchronous API for agent orchestration. |
| **Frontend** | **React + Vite** | Responsive Building Tools. |
| **Styling** | **CSS** | A dark themed website with golden-beige accents. |
| **Architecture** | **Multi-Agent Pipelining** | Zero-latency intent classification and expert routing. |
-----

## 📂 Project Blueprint

```text
csi-vegas/
├── backend/
│   ├── main.py            # API Entry & CORS Configuration
│   ├── orchestrator.py    # Intent-based routing logic
│   ├── agents.py          # Personas & The Auditor logic
│   └── scenario_gen.py    # Procedural case generation
├── frontend/
│   ├── src/
│   │   ├── components/    # Modular UI (Chat, Dossier, Evidence)
│   │   └── app.jsx        # Central Game State & Timer
└── README.md
```

## 🚀 Quick Start

### 1\. The Engine (Backend)

```bash
cd backend
# Create a .env with your GEMINI_API_KEY
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2\. The Interface (Frontend)

```bash
cd frontend
npm install
npm run dev
```

-----