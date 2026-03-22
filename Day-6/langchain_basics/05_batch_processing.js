// File: 05_batch_processing.js
// Purpose: Demonstrate sending multiple prompts at once to get an array of responses.

require('dotenv').config(); 
const { ChatGroq } = require('@langchain/groq');

async function run() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS, 
    model: 'llama-3.1-8b-instant',
  });

  console.log("Sending three distinct questions in one batch request...\n");

  // We have an array of different questions
  const questions = [
    "What is the capital of France?",
    "What is the largest planet in our solar system?",
    "Who wrote 'Hamlet'?"
  ];

  // .batch() takes an array of inputs and returns a Promise that resolves 
  // to an array of output AIMessage objects, corresponding to each input.
  const responses = await model.batch(questions);
  
  // Let's look at the raw AIMessage results first
  console.log("=== Batch Results (Raw Objects) ===");
  responses.forEach((res, index) => {
    console.log(`\nResponse to Q${index + 1}:`, res);
  });
  
  // Here's how we extract just the text
  console.log("\n\n=== Batch Results (Text Only) ===");
  responses.forEach((res, index) => {
    console.log(`Answer ${index + 1}: ${res.content}`);
  });
}

run().catch(console.error);
