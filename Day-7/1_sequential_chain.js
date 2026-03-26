import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// DAY 7: ADVANCED CHAINS - SEQUENTIAL CHAIN
// ============================================================================
// Concept: The output of one LLM call is fed directly as the input to the next.
// This is extremely useful for breaking down complex tasks. 
// Example: Write a play title -> Write a review of that play.
// ============================================================================

async function runSequentialChain() {
  console.log("Starting Sequential Chain Example...\n");

  // 1. Initialize our LLM
  // We use Gemini, picking a creative temperature for brainstorming
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS,
    model: "llama-3.3-70b-versatile", 
    temperature: 0.7,
  });

  // 2. Define our Prompts
  // Prompt 1: Generates a title Based on a Topic
  const titlePrompt = PromptTemplate.fromTemplate(
    "You are an eccentric playwright. Write a brilliant title for a theatrical play about {topic}. Only output the title and nothing else."
  );

  // Prompt 2: Writes a review based on the title
  const reviewPrompt = PromptTemplate.fromTemplate(
    "You are a harsh but fair theater critic. Write a very short, 2-sentence review for a play titled: {title}."
  );

  // 3. Create our Output Parser
  // This converts the complex LLM result object (AIMessage) into a simple string
  const outputParser = new StringOutputParser();

  // 4. Build the Chain using LCEL (LangChain Expression Language)
  // LCEL uses the `.pipe()` method to flow data from one step to the next seamlessly.
  
  // Base Chain 1: Topic -> Title
  const titleChain = titlePrompt.pipe(llm).pipe(outputParser);
  
  // Base Chain 2: Title -> Review
  // Notice how the 'title' variable here matches the {title} in reviewPrompt
  const reviewChain = reviewPrompt.pipe(llm).pipe(outputParser);

  // The Grand Sequential Chain
  const overallChain = RunnableSequence.from([
    // Step 1: Pass the initial topic to the titleChain, 
    // and map its output to the 'title' key for the next step.
    { title: titleChain }, 
    // Step 2: Pass the resulting object (which now looks like { title: "Some Play Title" }) into the reviewChain
    reviewChain
  ]);

  // 5. Execute the Chain
  const topic = "a time-traveling programmer who accidentally deletes the internet";
  console.log(`Topic: "${topic}"\n`);
  console.log("Waiting for LLM generation...\n");
  
  // invoke() triggers the entire sequence under the hood (Prompt1 -> LLM1 -> Parser -> Prompt2 -> LLM2 -> Parser)
  const finalReview = await overallChain.invoke({ topic: topic });

  console.log("Final Output (Play Review):");
  console.log("---------------------------");
  console.log(finalReview);
}

runSequentialChain().catch(console.error);
