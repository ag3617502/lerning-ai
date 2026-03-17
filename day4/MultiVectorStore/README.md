# MultiVectorStore - Isolated Multi-Chat Semantic Search

MultiVectorStore is an advanced implementation of semantic search that provides **isolation** across multiple chat sessions. By leveraging metadata filtering in a vector database, it ensures that searches are strictly confined to the context of the active conversation.

## 🚀 Key Features

-   **Multi-Chat Isolation**: Each chat session has its own "memory," preventing data leakage between different topics or users.
-   **Contextual Search**: Semantic search is performed *within* a specific workspace, using only the phrases synced to that chat.
-   **Real-time Context Panel**: A dedicated "Context Memory" sidebar to visualize stored phrases for the active workspace.

## 🛠️ Tech Stack & Characteristics

### Backend (BE)
-   **Node.js & Express**: Powers the RESTful API.
-   **MongoDB**: Manages chat sessions, titles, and persistent lists of synced phrases.
-   **ChromaDB**: The vector engine that stores Gemini-generated embeddings.
-   **Google Gemini API**: Utilized for `gemini-embedding-001` to generate high-quality text vectors.

### Frontend (FE)
-   **React & Vite**: A fast and responsive modern interface.
-   **Workspace Sidebar**: Easily switch between or create new chat environments.
-   **Integrated Search**: A chat-like interface where you can input queries and receive the most relevant match from the active workspace's memory.

## 🧠 How the Search Isolation Works

The magic of isolation happens through **Vector Metadata Filtering**:

1.  **Syncing**: Every time you sync phrases to a chat, they are sent to the backend along with a unique `chatId`.
2.  **Metadata Tagging**: When these phrases are stored in ChromaDB, the `chatId` is saved as a piece of metadata for every vector.
3.  **Filtered Querying**: When you search, the application doesn't just look for the closest vector. It uses a `where` clause in the ChromaDB query:
    ```javascript
    const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 1,
        where: { "chatId": activeChatId } // This ensures isolation!
    });
    ```
This ensures that even if other chats have similar content, the search will *only* return results that belong to the current `chatId`.

## 🚦 Getting Started

### Prerequisites
-   Node.js (v18+)
-   MongoDB instance (local or Atlas)
-   Google Gemini API Key
-   ChromaDB Access

### Setup Instructions

1.  **Backend**:
    -   `cd backend`
    -   `npm install`
    -   Configure `.env` with `MONGO_URI`, `GEMINI_API_KEY`, and ChromaDB credentials.
    -   `npm run dev` (Server runs on port 5000)

2.  **Frontend**:
    -   `cd frontend`
    -   `npm install`
    -   `npm run dev`

## 📂 Project Structure

-   `backend/controllers/embeddingController.js`: Contains the logic for chat creation, phrase syncing, and metadata-filtered search.
-   `backend/models/Chat.js`: MongoDB schema for storing chat sessions.
-   `frontend/src/App.jsx`: The main interface managing workspace state and API interactions.
