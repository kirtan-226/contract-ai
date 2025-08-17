# Contract-AI

**Contract-AI** is an AI-powered tool that analyzes contracts and lease agreements to detect risks, scams, and key clauses.  
It combines a **Node.js + Python backend** (LLM integration + heuristics) with a **React frontend chat UI**.

---

## ✨ Features
- 🔎 Detect whether text is a **real contract** or a **scam/fake**
- 🏠 Specialized support for **housing lease analysis** (extracts landlord, tenant, rent, term, etc.)
- ⚖️ **Risk assessment** with reasoning
- 💬 **Chat-like interface** with history saved locally
- 📤 Export/clear conversations
- 🌐 Supports **OpenAI** and **Hugging Face** models

---

## 🛠️ Tech Stack
- **Backend**: Node.js (Express) + Python (heuristics + LLM glue)
- **Frontend**: React (Vite) + Tailwind
- **Models**: OpenAI GPT, Hugging Face LLMs
- **Deployment**:  
  - Backend → Dockerized, hosted on [Render](https://render.com/)  
  - Frontend → Static build hosted on [Vercel](https://vercel.com/)  

---

## 📂 Project Structure
