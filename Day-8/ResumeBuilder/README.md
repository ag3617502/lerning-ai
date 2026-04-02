# Day 8: AI Resume Builder - Context-Aware Chat & Auto Generation
Welcome to Day 8 of the AI Learning Journey! Today, the project tackles the complex task of dynamically building professional resumes using a conversational AI agent.

---

## 🚀 What We Accomplished on Day 8

### 1. Conversational AI Extraction
Instead of traditional multi-step forms, users just talk to the AI. The Agent uses Groq and LangChain to extract deeply structured JSON data covering:
- Personal Details (Name, Email, Location)
- Education (Degree, University, Timeline)
- Experience & Projects (Company, Tech Stack, Description)

### 2. Full-Stack WebSockets Architecture
Implemented real-time bidirectional communication using **Socket.IO**:
- **Streaming Responses**: Live typing effect for AI messages.
- **Instant Previews**: Emits extracted resume data immediately to the frontend.
- **Session Continuity**: Retains context within the socket connection.

### 3. Persistent Authentication & History
Similar to Day 2, we utilized a mature auth system but expanded it for multiple chats:
- **JWT Authentication** to secure REST endpoints and WebSockets.
- **Session Sidebar**: Track old resume-building conversations via MongoDB.
- Isolated workspaces per user.

---

## 📂 Project Structure

```text
Day-8/ResumeBuilder
│
├── backend/             # Node.js + Express + Socket.IO server
│   ├── config/          
│   ├── controllers/     
│   ├── middleware/      # JWT protection
│   ├── models/          # User, Chat, Resume schemas
│   ├── routes/          
│   ├── services/        # LangChain, Groq, ChromaDB logic
│   └── templates/       # Resume preview templates
│
├── frontend/            # React + Vite application
│   └── src/             # Chat UI, Sidebar, Live Preview Canvas
│
└── README.md            # You are here
```

---

## 🛠️ Getting Started

### 1. Backend Setup
See [backend/README.md](./backend/README.md) for full instructions.

### 2. Frontend Setup
See [frontend/README.md](./frontend/README.md) for full instructions.

---

## 🧠 Why This Matters
True AI products reduce user friction. An intelligent resume builder that "figures out" what you need based on conversational input demonstrates advanced LangChain structured capabilities and robust state persistence.
