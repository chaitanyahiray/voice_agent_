# voice_agent_task - Transform Audio into Actionable Insights

AI-powered app to **record or upload audio**, then get:
- Full **transcriptions**
- **Summaries & action items**
- **Entity extraction** (names, dates, phone numbers)
- **Intent classification**

---

##  Features
- Record audio from microphone or upload files (`.mp3`, `.wav`, etc.)
- Uses **OpenAI Whisper** for accurate transcription (supports large audio with chunking)
- Extracts structured insights (summary, action items, intent)
- Detects entities (people, dates, phone numbers)
- Runs with **Docker Compose** (frontend + backend)

---


##  Setup Instructions

### 1️ Clone the repo
```bash
git clone https://github.com/chaitanyahiray/voice_agent_.git
cd VoiceAgent
```

### 2️ Add environment variables
Create a `.env` in the project root:
```bash
# .env
OPENAI_API_KEY=**********
USE_MOCK=false   # set true to use mock data (no API calls)
```


### 3️ Run with Docker 
```bash
docker-compose up --build
```
- Frontend → http://localhost:3000
- Backend → http://localhost:5000

### 4️ Run without Docker 

**Backend:**
```bash
cd backend
npm install
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # or: npm run build && npm start
```

---

##  Architecture Diagram
```
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │  Frontend   │ ────►  │  user (UI)  │ ────►  │   Backend   │
  │ Next.js app │        │  Mic / File │        │ Express API │
  └─────────────┘        └─────────────┘        └──────┬──────┘
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │ OpenAI (Whisper │
                                               │ + GPT Models)   │
                                               └─────────────────┘
```

##  Tech Stack
- **Backend**: Node.js, Express, OpenAI API
- **Frontend**: Next.js
- **Deployment**: Docker + Docker Compose

---

