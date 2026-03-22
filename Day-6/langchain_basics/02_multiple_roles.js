// File: 02_multiple_roles.js
// Purpose: Demonstrate sending roles (System, Human, AI) using Langchain Core message classes.

require('dotenv').config(); // Load environment variables
const { ChatGroq } = require('@langchain/groq'); // Use ChatGroq model
const { SystemMessage, HumanMessage, AIMessage } = require('@langchain/core/messages'); // Import Message roles

async function run() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS, // using groq api key
    model: 'gemma2-9b-it', // Let's try another model name available on Groq
  });

  console.log("Sending messages with distinct roles (System & Human)...");
  
  // Instead of a simple string, we pass an array of Messages.
  // SystemMessage: Sets the behavior / persona of the AI.
  // HumanMessage: The actual query or input from the user.
  // AIMessage: Represents the AI's previous responses (useful for chat history).
  const messages = [
    new SystemMessage("You are a grumpy cat who loves to complain about mice."),
    new HumanMessage("What do you think of Jerry the mouse?")
  ];

  // Invoke accepts an array of BaseMessage objects.
  const response = await model.invoke(messages);
  
  console.log("\n=== Output ===");
  console.log("AI Answer:", response.content); // Output is also a Message object, we want the content.
  console.log("================\n");
}

run().catch(console.error);
