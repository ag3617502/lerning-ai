# Day 7: Advanced LangChain Chains & Hybrid Search

Welcome to Day 7! Before rushing into building autonomous AI Agents, it is **critical to make your foundation strong**. This module focuses on mastering how to orchestrate multiple LLM calls together (Chains) and how to improve document retrieval accuracy (Hybrid Search).

## 🔗 Core LCEL Chains (LangChain Expression Language)

We built 4 distinct chain patterns using the modern LCEL `.pipe()` syntax:

1. **`1_sequential_chain.js` (Sequential)**: Pipelining the direct output of one prompt into another. (Example: Title Generator -> Review Generator).
2. **`2_routing_chain.js` (Routing)**: Dynamically analyzing a user's question and routing it to a specialized prompt (e.g. Math vs Biology vs General) using `RunnableBranch`.
3. **`3_parallel_chain.js` (Parallel Execution)**: Executing multiple independent LLM tasks at the exact same time to drastically cut down processing time using `RunnableParallel`.
4. **`4_fallback_chain.js` (Fallbacks)**: Building bulletproof production apps by catching API failurs or rate limits and seamlessly falling back to a secondary LLM using `.withFallbacks()`.

## 🔍 Hybrid Search

5. **`5_hybrid_search.js`**: We built a custom Hybrid Retriever!
   - Pure Vector (Semantic) Search is great for understanding concepts but terrible at finding exact matches (like specific names, acronyms, or Employee IDs).
   - Pure Keyword Search is great for exact matches but lacks contextual understanding.
   - We combined an exact-keyword matching algorithm with a Semantic Vector Database.
   - The results from both are merged and deduplicated, giving you the absolute best chunk of knowledge for the LLM!

## ⚙️ How to Run
We are using `Groq` (specifically the `llama-3.3-70b-versatile` model) for lightning-fast inference. Ensure you have your `.env` configured inside this folder with your `GROQ_API_KEYS`.

Run any of the examples directly in your terminal:
```bash
node 1_sequential_chain.js
node 2_routing_chain.js
node 3_parallel_chain.js
node 4_fallback_chain.js
node 5_hybrid_search.js
```
