import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// DAY 7: ADVANCED CHAINS - FALLBACK CHAIN
// ============================================================================
// Concept: Production apps fail. Rate limits happen. Fallback chains let you
// automatically switch to a different LLM (or a different provider) if the 
// primary one fails, preventing app crashes.
// ============================================================================

async function runFallbackChain() {
  console.log("Starting Fallback Chain Example...\n");

  // We intentionally misconfigure our primary LLM to simulate an outage or a bad API key.
  const badGroq = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: "this-is-a-fake-bad-key-that-will-fail-on-purpose"
  });

  // This is our reliable backup LLM (Using our real API key from .env automatically)
  const goodGroq = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS,
    model: "llama-3.3-70b-versatile",
  });

  const prompt = PromptTemplate.fromTemplate(
    "Tell me a very short 1-line joke about a programmer and a {topic}."
  );

  const parser = new StringOutputParser();

  // 1. Create the primary, fragile chain
  const fragileChain = prompt.pipe(badGroq).pipe(parser);

  // 2. Create the reliable backup chain
  const reliableChain = prompt.pipe(goodGroq).pipe(parser);

  // 3. Combine them using .withFallbacks()
  // If fragileChain throws an error during execution, LangChain instantly intercepts it and tries reliableChain.
  const resilientChain = fragileChain.withFallbacks({
    fallbacks: [reliableChain]
  });

  console.log("Invoking resilient chain...");
  console.log("Expect an internal error log from the primary LLM, but the chain will succeed overall because of the backup!\n");

  try {
    const result = await resilientChain.invoke({ topic: "rubber duck" });
    console.log("==========================================");
    console.log("SUCCESS! Here is the result from the backup model:");
    console.log(result);
  } catch (err) {
    console.error("The whole process failed. This means both the primary AND fallback failed:", err);
  }
}

runFallbackChain().catch(console.error);
