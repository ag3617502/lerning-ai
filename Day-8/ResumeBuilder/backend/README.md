# AI Resume Builder - Backend

This folder contains the Node.js API, LangChain logic, and WebSocket server that powers the AI Resume Builder.

## 🚀 Features
- **Express & REST API**: Handles JWT authentication, file uploads, and session management.
- **Socket.IO**: Powers the real-time chat interface. Includes JWT validation on connection handshakes.
- **LangChain + Groq**: Implements structured output extraction via advanced prompting, picking apart user conversational intent.
- **MongoDB**: Persists the chat history and extracted parameters per session.
- **ChromaDB Integration**: For indexing previous experiences or cover letters.

## 🛠️ Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy the provided `.env.test` to `.env` and fill in your actual API keys:
   ```bash
   cp .env.test .env
   ```
   **Note**: Never commit your actual `.env` file containing secrets!

3. **Run the Server**
   ```bash
   node server.js
   # or npm start if script is present
   ```

   The server will default to port `5008`.

## 📁 Important Directories
- **`services/resumeAI.js`**: Core logic for interacting with Groq via LangChain.
- **`models/`**: Mongoose schemas enforcing data integrity for Chats and Users.
