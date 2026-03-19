# Day 2: AI Personal Assistant - Modular Architecture & Authentication with Context Aware AI
👉 Live Demo: https://ag3617502.github.io/contextAwareAIFE
Welcome to Day 2 of the AI Learning Journey! Today, the project transitioned from a basic script to a professional, scalable application with a modular backend and secure user authentication.

---

## 🚀 What We Accomplished on Day 2

### 1. Modular Backend Architecture (MVC Pattern)
The backend has been completely refactored into a structured organization to ensure scalability and maintainability:
- **`config/db.js`**: Centralized MongoDB connection logic.
- **`models/`**: Defined data schemas for `User` and `Conversation` using Mongoose.
- **`controllers/`**: Separated business logic (Auth and Chat handling) from application routes.
- **`routes/`**: Clean endpoint definitions for API interaction.
- **`middleware/`**: Implemented `authMiddleware` to protect private routes using JWT.
- **`services/`**: Abstraction layer for external AI services (Groq SDK).

### 2. User Authentication & Security
Implemented a complete authentication system:
- **Signup/Login**: Users can create accounts and securely sign in.
- **Password Hashing**: Sensitive credentials are encrypted using **Bcrypt** before storage.
- **JWT Protection**: All chat interactions are secured. A **JSON Web Token (JWT)** is required for all API requests.
- **Data Privacy**: Conversations are strictly isolated—users can only access their own specific chat history.

### 3. AI Context & Memory Persistence
Standard LLMs are **stateless** (they don't remember previous messages). We solved this by:
- **Saving Messages**: All user and AI messages are persisted in **MongoDB**.
- **Context Window**: Before every AI request, we fetch and send a sliding window of previous messages. This allows the AI to "remember" the conversation flow.

---

## 📂 Project Structure

```text
project-root
│
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic (Auth, Chat)
│   ├── middleware/      # Authentication (JWT) protection
│   ├── models/          # Mongoose schemas (User, Conversation)
│   ├── routes/          # API endpoints
│   ├── services/        # AI Service abstraction (Groq)
│   └── server.js        # Main application entry point
│
├── frontend/
│   └── src/             # React App with Auth & Chat UI
│
├── .env                 # API Keys & Secrets
└── README.md            # Documentation
```

---

## 🛠️ Getting Started

### 1. Backend Setup
1. Clone the repository and navigate to the `backend` folder.
2. Install dependencies: `npm install`.
3. Create a `.env` file in the root with:
   ```text
   GROQ_API_KEYS=your_groq_api_key
   JWT_SECRET=your_secret_key
   MONGODB_URI=mongodb://localhost:27017/ai_chatbot
   ```
4. Start the server: `npm start`.

### 2. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Start the UI: `npm run dev`.

---

## 🧠 Why This Matters
Building an AI chatbot isn't just about calling an API; it involves managing **state**, **privacy**, and **persistence**. By implementing modular architecture and context management, we've created a foundation for advanced AI agents.

🚀 Onward to Day 3!
