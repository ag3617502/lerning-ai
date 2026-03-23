# Document Chat Backend

The backend of our Context-Aware AI application is built with **Node.js, Express, and MongoDB**, leveraging **Langchain** to process documents and hold conversations.

## Architecture & Folder Structure

We implemented a robust **MVC (Model-View-Controller)** architecture to keep the logic clean and scalable:

*   **`/src/config`**: Database connection setups (MongoDB).
*   **`/src/models`**: Mongoose schemas defining our data relationships (`User`, `Conversation`, `Message`).
*   **`/src/controllers`**: Core business logic mapped to specific routes.
*   **`/src/routes`**: API endpoint definitions acting as the entry point for frontend requests.
*   **`/src/middlewares`**: Utility functions intercepting requests (e.g., JWT `authMiddleware` for secure routes, and `multer` for raw file uploads).
*   **`/src/services`**: Specialized logic, primarily `langchainService.js` which handles:
    *   Loading PDFs.
    *   Chunking text intelligently.
    *   Generating Embeddings via **Gemini** and securely syncing them with **ChromaDB Cloud**.
    *   Answering questions using **Groq** LLMs via LCEL (LangChain Expression Language).

## Core Features
1. **User Authentication**: Secure Sign-Up/Login flows issuing JSON Web Tokens (JWT).
2. **Vector Database Integration**: Documents are mapped to a Chroma Vector Store collection linked directly to the user's specific conversational thread.
3. **Contextual Chat**: Every response directly references the ingested document context safely.
