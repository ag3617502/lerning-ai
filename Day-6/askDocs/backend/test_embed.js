require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Fetching models...");
    
    // Fallback if listModels doesn't exist on the client, we just do a REST fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available embedding models:");
      data.models.forEach(m => {
        if (m.name.includes("embed") || m.name.includes("text")) {
          console.log(`- ${m.name} [supported: ${m.supportedGenerationMethods.join(", ")}]`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
