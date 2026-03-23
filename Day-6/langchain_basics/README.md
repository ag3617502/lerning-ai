# Langchain Basics

This directory contains the foundational scripts and experiments used to learn the core concepts of Langchain and LLM interactions before building the full-stack application.

## Key Learnings & Scripts

1. **Basic Invoke (`01_basic_invoke.js`)**: Learned how to initialize an LLM (Groq) and send a simple prompt to get a response.
2. **Multiple Roles (`02_multiple_roles.js`)**: Explored system prompts and human messages, shaping the AI's persona and context.
3. **Temperature and Tokens (`03_temperature_and_tokens.js`)**: Experimented with the `temperature` parameter to control creativity/randomness, and `maxTokens` to limit the response length.
4. **Streaming Output (`04_streaming_output.js`)**: Handled real-time streaming of AI responses chunk-by-chunk for a better user experience.
5. **Batch Processing (`05_batch_processing.js` & `06_batch_content_only.js`)**: Learned how to send multiple prompts simultaneously and efficiently parse the parallel outputs.

These scripts served as the critical stepping stones before integrating Langchain securely into the Express backend MVC!
