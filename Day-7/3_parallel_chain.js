import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableParallel, RunnableSequence } from "@langchain/core/runnables";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// DAY 7: ADVANCED CHAINS - PARALLEL CHAIN
// ============================================================================
// Concept: Running multiple LLM calls concurrently instead of sequentially.
// This is critical for performance when tasks do not depend on each other.
// Example: Get the Pros of a technology and the Cons at the exact same time.
// ============================================================================

async function runParallelChain() {
  console.log("Starting Parallel Chain Example...\n");

  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS,
    model: "llama-3.3-70b-versatile",
  });
  const parser = new StringOutputParser();

  // 1. Define prompts for our parallel tasks
  const prosPrompt = PromptTemplate.fromTemplate(
    "List 3 major pros of {topic}. Keep it brief."
  );
  
  const consPrompt = PromptTemplate.fromTemplate(
    "List 3 major cons of {topic}. Keep it brief."
  );

  // 2. Build the individual branches
  const prosChain = prosPrompt.pipe(llm).pipe(parser);
  const consChain = consPrompt.pipe(llm).pipe(parser);

  // 3. Create the RunnableParallel module
  // It takes an object where keys are the output names, and values are runnables.
  // When invoked, it runs all runnables inside it AT THE EXACT SAME TIME!
  const parallelChain = RunnableParallel.from({
    pros: prosChain,
    cons: consChain,
    original_topic: (input) => input.topic // We explicitly pass through the original input string
  });

  // 4. (Optional) Chain the parallel outputs into a final summarizer
  const summaryPrompt = PromptTemplate.fromTemplate(
    `You are an impartial technology judge. Review the pros and cons of {original_topic} and give a 1-sentence final verdict.
    
    PROS:
    {pros}
    
    CONS:
    {cons}
    
    FINAL VERDICT:`
  );
  const summaryChain = summaryPrompt.pipe(llm).pipe(parser);

  // The final coordinated sequence
  const fullChain = RunnableSequence.from([
    parallelChain, // Step 1: get pros and cons simultaneously (Parallel Execution)
    summaryChain   // Step 2: feed them into the summarizer (Sequential Execution)
  ]);

  // 5. Execute 
  const topic = "Artificial General Intelligence (AGI)";
  
  console.log(`Analyzing: "${topic}"`);
  console.log("Running underlying prompts concurrently (This saves a huge amount of time!)...\n");

  const startTime = Date.now();
  // We invoke the full sequence. LangChain automatically forks into parallel logic and waits for both to finish.
  const verdict = await fullChain.invoke({ topic: topic });
  const endTime = Date.now();

  console.log(`Final Verdict from Judge:\n${verdict}`);
  console.log(`\nExecution time: ${(endTime - startTime) / 1000} seconds`);
}

runParallelChain().catch(console.error);
