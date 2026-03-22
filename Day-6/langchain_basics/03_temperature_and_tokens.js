// File: 03_temperature_and_tokens.js
// Purpose: Teach students how configuration parameters like temperature and maxTokens work.

require('dotenv').config(); // Load environment variables
const { ChatGroq } = require('@langchain/groq');

async function run() {
  console.log("Configuring a model with custom Temperature and Max Tokens...\n");

  // We define model parameters inside the initialization object.
  // temperature: Controls randomness. 0 is deterministic (same output usually), 1 is very creative.
  // maxTokens: Limits how long the response can be (in tokens, not letters).
  const creativeModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS, 
    model: 'llama-3.1-8b-instant',
    temperature: 0.9, // High creativity/randomness
    maxTokens: 50 // Strict limit on response length
  });
  
  const strictModel = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS, 
    model: 'llama-3.1-8b-instant',
    temperature: 0.0, // Strict, deterministic, predictable
    maxTokens: 150 // Larger limit for a full answer
  });

  const prompt = "Write a highly creative poem about coding.";

  console.log("Prompt:", prompt);
  
  console.log("\n--- Creative Model (Temp 0.9, Tokens 50) ---");
  const response1 = await creativeModel.invoke(prompt);
  console.log(response1.content); 
  // Notice it might cut off midway because maxTokens is only 50

  console.log("\n--- Strict Model (Temp 0.0, Tokens 150) ---");
  const response2 = await strictModel.invoke(prompt);
  console.log(response2.content); 
}

run().catch(console.error);
