// File: 01_basic_invoke.js
// Purpose: Demonstrate the simplest way to send a string prompt and get a response.

require('dotenv').config(); // Load environment variables from .env file
const { ChatGroq } = require('@langchain/groq'); // Import ChatGroq class from LangChain

async function run() {
  // Initialize the Groq model
  // Note: We use GROQ_API_KEYS as your .env has named it GROQ_API_KEYS instead of GROQ_API_KEY
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS, // Access the API key from environment
    model: 'llama-3.1-8b-instant', // Specify the model name to use
  });

  console.log("Sending a basic string prompt..."); // Informing the user before sending
  
  // The invoke method is the most basic way to get a single completion
  // We pass a simple string as the human prompt.
  const response = await model.invoke("What is LangChain? Explain in one sentence.");
  
  // The response from invoke is an AIMessage object.
  // To get the actual text reply, we read res.content.
  console.log("\n=== Output ===");
  console.log("Full Message Object:", response); // Let students see the raw object
  console.log("\nActual Content:", response.content); // Let students see just the text message
  console.log("================\n");
}

// Execute the async code
run().catch(console.error);
