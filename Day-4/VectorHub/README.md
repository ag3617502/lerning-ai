# VectorHub - Semantic Search with Vector DB

VectorHub is a full-stack application designed to demonstrate the power of **Semantic Search** using **Vector Databases**. Unlike traditional keyword-based search, semantic search understands the *meaning* and *context* of your data, allowing it to find relevant results even when the exact words don't match.

## 🚀 Overview

This project showcases a complete workflow for:
1.  **Text Embedding**: Converting text data into high-dimensional numerical vectors using Google's Gemini AI.
2.  **Vector Storage**: Storing these embeddings in **ChromaDB**, a specialized vector database.
3.  **Semantic Retrieval**: Finding the most similar documents to a search query based on vector distance.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Vanilla CSS.
-   **Backend**: Node.js, Express.
-   **Database**:
    -   **ChromaDB**: The core Vector Database for storing and querying embeddings.
-   **AI Engine**: Google Gemini API (`gemini-embedding-001`).

## 🧠 How Vector DB Works Here

1.  **Embedding Generation**: When you upload text (or search for something), the backend sends that text to the Google Gemini API. Gemini returns a vector (a list of 768 numbers) that represents the "essence" of that text.
2.  **Indexing**: This vector is stored in ChromaDB along with the original text and unique IDs.
3.  **Similarity Search**: When you search, your query is also converted into a vector. ChromaDB then performs a mathematical comparison (e.g., Cosine Similarity) to find the vectors in the database that are closest to your query vector.
4.  **Results**: The "closest" matches are returned, providing semantically relevant results.

## 🚦 Getting Started

### Prerequisites

-   Node.js (v18+)
-   A [Google AI Studio](https://aistudio.google.com/) API Key.
-   Access to [ChromaDB](https://trychroma.com/) (using the cloud tenant/headers provided in `.env`).

### Backend Setup

1.  Navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file and add your credentials:
    ```env
    PORT=5000
    GEMINI_API_KEY=your_gemini_api_key
    CHROMA_API_KEY=your_chroma_api_key
    CHROME_TENANT_ID=your_tenant_id
    CHROME_DATABASE=default_database
    MONGO_URI=your_mongodb_uri
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

-   `backend/`: Express server, controllers, and configuration for Gemini/ChromaDB.
-   `frontend/`: React application for interacting with the semantic search API.
-   `config/`: Setup for database connections and AI clients.
