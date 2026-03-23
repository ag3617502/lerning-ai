# Day 6: Full-Stack Context-Aware AI Chatbot

It's Day 6 of my AI Journey! Today marks a massive milestone: bridging isolated AI scripts into a fully functional, production-ready Full-Stack Application. 

We successfully combined concepts of Node.js routing, React interface design, User Authentication, and Vector Search to build a premium Document-Chat application.

---

## 1. Langchain Basics (`/langchain_basics`)
Before building the app, we solidified our understanding of LangChain by running node scripts to master the fundamentals:
*   **Basic Invoke & Roles:** Establishing an LLM connection (Groq) and understanding the difference between `System` prompts and `Human` inputs.
*   **Parameters:** Tweaking `temperature` and `maxTokens` to directly influence the LLM's brain limits and creativity.
*   **Streaming & Batching:** Learning how to stream text chunk-by-chunk for an immediate UX, and batching arrays of prompts for parallel evaluation.

## 2. The Backend (`/backend`)
We constructed a secure **RESTful Express API** connected to **MongoDB**.
*   **Structure:** We utilized an MVC architecture (`controllers`, `routes`, `services`, `models`).
*   **Authentication:** Users are securely registered and logged in using Bcrypt hashing and JSON Web Tokens (JWT).
*   **Document Ingestion:** Handled file uploads seamlessly via `multer`.
*   **AI Integration (`langchainService.js`)**: 
    1. Parsed PDFs into text.
    2. Filtered and Chunked the text securely.
    3. Converted text into vectors using **Gemini (text-embedding-004 / gemini-embedding-001)**.
    4. Upserted those vectors into a **Hosted ChromaDB Cloud** cluster securely.
    5. Utilized an LCEL Runnable Sequence pointing to **Groq** to answer user queries exclusively based on their uploaded document.

## 3. The Frontend (`/frontend`)
We brought the application to life with **React, Vite, and TailwindCSS**.
*   **Structure:** We stringently followed the **Atomic Design Structure**, separating components into `Atoms`, `Molecules`, `Organisms`, and `Pages`.
*   **UI/UX:** We built a dark-themed, premium interface inspired by standard ChatGPT layouts. It features a conversational history `Sidebar`, a beautiful Drag-and-Drop `UploadArea`, and an interactive `ChatArea`.
*   **Flow:** Users sign up, create an isolated conversation thread, and are entirely blocked from chatting *until* they successfully map a PDF document to that specific thread. Once loaded, they effortlessly chat with their exact data!

---

**Summary:** We evolved from simple AI scripting to architecting a highly scalable, authenticated, full-stack LLM application driven by a powerful Vector Database. Keep moving forward!
