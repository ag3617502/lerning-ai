// File: 04_streaming_output.js
// Purpose: Demonstrate how to stream output character by character for a typing effect.

require('dotenv').config(); // Load environment variables
const { ChatGroq } = require('@langchain/groq');

async function run() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS, 
    model: 'llama-3.1-8b-instant',
  });

  const prompt = "Explain quantum computing to a 5-year-old in exactly three sentences.";
  console.log(`Prompt: ${prompt}\n`);
  console.log("=== Streaming Output ===");
  
  // Using .stream() returns an iterable, allowing us to process parts of the response as they arrive.
  const stream = await model.stream(prompt);
  
  // As chunks of data are received, we log them immediately
  // process.stdout.write prints without adding a new line
  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }
  
  console.log("\n\n=== Stream Completed ===");
}

run().catch(console.error);
