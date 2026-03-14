# Day 1: Understanding LLMs & Building a Basic AI Chatbot

Welcome to Day 1 of my AI learning journey.  
Today I started exploring **Large Language Models (LLMs)** and integrated an AI model into a simple chatbot application.

---

# What is a Large Language Model (LLM)

A **Large Language Model (LLM)** is a type of artificial intelligence trained on massive amounts of text data to understand and generate human-like language.

LLMs can perform tasks such as:

- Answering questions
- Writing code
- Summarizing text
- Translating languages
- Generating content

Popular LLMs used in modern AI applications include:

- GPT models by OpenAI  
- Gemini by Google  
- Claude by Anthropic  
- LLaMA by Meta  

These models are trained on **huge datasets containing books, articles, websites, and code**, allowing them to understand patterns in human language.

---

# How LLMs Generate Responses

LLMs work using a deep learning architecture called the **Transformer**.

Instead of “thinking” like humans, they **predict the most probable next word based on the context of the prompt**.

Example:

Prompt:

Explain what JavaScript is


Possible AI response:

JavaScript is a programming language used to build interactive web applications.


The model generates responses **token by token** until the answer is complete.

---

# Important LLM Concepts

### Prompt
The input or instruction given to the AI.

Example:

Explain React in simple terms


### Tokens
Small pieces of text that the AI processes.

Example:

Hello world


may be split into tokens like:

Hello | world


### Context Window
The maximum amount of text an AI model can process at one time.

### Temperature
Controls randomness of the response.

- Low temperature → more deterministic answers  
- High temperature → more creative answers

---

# Day 1: Project Work

Along with learning the theory, I built a **basic AI chatbot using Node.js and React**.

## What we have done so far

1. **Backend Setup**  
   Created a Node.js Express server to securely communicate with the Groq AI API.

2. **Frontend Setup**  
   Initialized a React application using Vite with a premium dark-themed UI.

3. **Real-time Streaming**  
   Implemented streaming responses so that AI answers appear word-by-word similar to modern AI chat interfaces.

4. **Project Maintenance**  
   Configured `.gitignore` and environment templates to keep the repository clean and secure.

---

# Getting Started: Setup Groq API Key

To run this project, you need an API key from Groq.

### Step 1
Visit  
https://console.groq.com/keys

### Step 2
Sign in using your Google account or email.

### Step 3
Click **Create API Key**.

### Step 4
Give your key a name (example: `Learning-AI`).

### Step 5
Copy the generated API key.

### Step 6
Create a `.env` file in the project root and add:


GROQ_API_KEYS=your_key_here


---

# Project Structure


project-root
│
├── backend
│ └── Node.js Express server communicating with Groq API
│
├── frontend
│ └── React application with chat interface
│
├── .env
│ └── Environment variables (API keys)
│
└── .gitignore
└── Excludes node_modules and sensitive files


---

# Summary

Today I learned:

- What **Large Language Models (LLMs)** are
- How LLMs generate responses
- Important AI concepts like prompts and tokens
- How to integrate an AI model into a **Node.js + React chatbot**

This is the **first step toward building more advanced AI applications**.

---

🚀 Learning AI one day at a time.