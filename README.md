# 🚀 AI Learning Journey

Welcome to our project! This repository documents our journey of learning Artificial Intelligence, starting from the fundamentals and moving towards advanced concepts.

## 📅 Day 1: The Beginning
On our first day, we focused on setting the foundation:
- **Introduction to AI**: Understanding the core concepts and the importance of LLMs.
- **Basic Chatbot Project**: A simple AI Chatbot that handles single-question-and-answer interactions.

### 🧠 What is an LLM?
A Large Language Model (LLM) is a type of AI trained on massive amounts of text data. It can understand, generate, and manipulate human language, making it the backbone of modern AI applications like chatbots and content creators.

## 📅 Day 2: Advanced Foundation
On our second day, we leveled up our project with a modular architecture and intelligent state management:
- **Modular Backend Architecture**: Refactored the code into an MVC pattern (Models, Controllers, Routes) for better scalability.
- **User Authentication**: Implemented secure Signup and Login using JWT and password hashing (Bcrypt).
- **Conversation Persistence**: Integrated MongoDB to save and retrieve chat history.

### 🧠 Context & Short-Term Memory in AI
In our Day 2 project, we addressed one of the most critical aspects of AI applications: **Context**.

**What is Context?**
Context refers to the information the AI "sees" at the time of generating a response. Standard LLMs are inherently **stateless**, meaning they treat every question as a brand-new interaction and forget everything about previous messages.

**Why is Context Important?**
Without context, an AI cannot follow a conversation. If you say "Who is the President of the USA?" followed by "How old is he?", the AI needs context (the first question) to know who "he" refers to.

**Short-Term Memory Implementation**
In this project, we implemented **Short-Term Memory** by:
1. **Storing history**: Every user query and AI response is saved in our database.
2. **Context Window**: Before sending a new prompt to the AI, we fetch a "sliding window" of the most recent messages (e.g., the last 10 messages).
3. **Injecting History**: We send this history back to the AI with the new query, effectively giving it a "short-term memory" so it can maintain the flow of the conversation.

## 🛠️ Prerequisites
This journey is designed for developers who already have experience with:
- **JavaScript**
- **Node.js**
- **React.js**

## 🗺️ Roadmap
We started simple, but we will be adding many powerful features in the future, including:
- **Multi-Models**: Integrating various AI models for different tasks.
- **Agents**: Building autonomous entities that can perform complex actions.
- **RAG (Retrieval-Augmented Generation)**: Enhancing AI responses with private or specific data.
- **Embeddings & Vector Databases**: Storing and retrieving semantic information efficiently.
- **LangChain**: Using a unified platform to call and manage multiple AI APIs seamlessly.

---
*This repository serves as a basic demo structure of our whole AI learning journey.*
