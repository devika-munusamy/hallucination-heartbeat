# Hallucination Heartbeat — AI Observability & Guardrails

**Hallucination Heartbeat** is a professional-grade, real-time AI observability platform designed to intercept, analyze, and audit LLM responses before they reach your end users. It acts as a mission-critical **safety net** for production AI workloads.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js 22+**
- **Python 3.10+**
- **MongoDB** (Running on `localhost:27017`)

### 2. Launch Everything
We've unified the development workflow. Simply run the orchestration script from the root directory:

```bash
# Start AI Service, Backend, and Dashboard
bash run_all.sh
```

### 3. Access the Studio
- **Observability Studio:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:3001](http://localhost:3001)
- **AI Scoring Engine:** [http://localhost:8000](http://localhost:8000)

---

## 🏗️ Architecture

1. **Ingestion Engine (Node.js 22):** A high-throughput Express backend that captures telemetry (prompts, responses, tokens, latency) in under 20ms.
2. **Audit Engine (FastAPI):** A Python-based semantic analyzer that evaluates LLM grounding and flags hallucinations based on knowledge consistency.
3. **Observability Studio (React/Vite):** A premium, glassmorphic dashboard for real-time trace inspection and threshold alerting.
4. **Persistence Layer (MongoDB):** Long-term storage for trace history and performance analytics.

---

## 🎯 Current Status & Next Plans

### ✅ Completed
- [x] **Monorepo Structure** with decoupled microservices.
- [x] **Live Trace Feed:** High-performance dashboard with real-time updates.
- [x] **Premium AI UI:** Stunning dark-themed "Observability Studio" experience.
- [x] **Simulator Tool:** Built-in trace simulation for testing guardrails.

### 🚀 Roadmap
- [ ] **Advanced Semantic Audits:** Replace mock scores with real embedding-based grounding checks.
- [ ] **Automatic Kill-Switches:** Block hallucinating responses from reaching production APIs.
- [ ] **Slack/Email Guardrails:** Trigger real-time notifications for model reliability drops.
- [ ] **Model Comparison:** Visualize A/B reliability stats between GPT-4o, Llama 3, and Claude.

---

## 📂 Project Structure
```text
├── ai-service/   # Python FastAPI (Hallucination Scoring)
├── backend/      # Node.js Express (Telemetry Ingestion)
├── frontend/     # React + Vite (Observability Dashboard)
├── docs/         # System documentation
└── run_all.sh    # Unified orchestration script
```

---

## 💎 Portfolio Value
This project demonstrates the transition from "building AI toys" to "operating AI at scale." It showcases expertise in **AI Observability**, **LLM Reliability Engineering**, and **Decoupled Architecture**—capabilities critical for high-stakes enterprise AI deployments.
