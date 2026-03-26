import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableBranch, RunnableSequence } from "@langchain/core/runnables";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// DAY 7: ADVANCED CHAINS - ROUTING CHAIN
// ============================================================================
// Concept: Dynamically routing the prompt to specialized LLM chains based on
// an initial assessment of the user's input.
// Example: Route math questions to a Math prompt, biology to Biology prompt.
// ============================================================================

async function runRoutingChain() {
  console.log("Starting Routing Chain Example...\n");

  // We set temperature to 0 for maximum deterministic accuracy
  const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS,
    model: "llama-3.3-70b-versatile",
    temperature: 0, 
  });

  const outputParser = new StringOutputParser();

  // 1. Define our specialized prompts
  const mathPrompt = PromptTemplate.fromTemplate(
    "You are a grumpy math professor. Answer this math question strictly and without humor: {question}"
  );

  const bioPrompt = PromptTemplate.fromTemplate(
    "You are an overly excited biology teacher. Answer this biology question with intense enthusiasm: {question}"
  );

  const generalPrompt = PromptTemplate.fromTemplate(
    "You are a helpful assistant. Answer the following question normally: {question}"
  );

  // Build the specialized sub-chains
  const mathChain = mathPrompt.pipe(llm).pipe(outputParser);
  const bioChain = bioPrompt.pipe(llm).pipe(outputParser);
  const generalChain = generalPrompt.pipe(llm).pipe(outputParser);

  // 2. Define the Router Prompt
  // We need the LLM to classify the input first so we know where to route it.
  const classificationPrompt = PromptTemplate.fromTemplate(
    `Given the user question below, classify it as exactly one of: \`math\`, \`biology\`, or \`general\`.
    Do not respond with anything else except the classification word.
    
    Question: {question}
    Classification:`
  );

  // This classification chain will simply output a single word: "math", "biology", or "general"
  const classificationChain = classificationPrompt.pipe(llm).pipe(outputParser);

  // 3. Build the RunnableBranch 
  // RunnableBranch takes an array of pairs: [(condition function), (chain to execute if condition is true)]
  // The final element is the default fallback chain if no conditions are matched.
  const routingBranch = RunnableBranch.from([
    // Condition 1: Math
    [
      (x) => x.topic.toLowerCase().includes("math"),
      mathChain
    ],
    // Condition 2: Biology
    [
      (x) => x.topic.toLowerCase().includes("biology"),
      bioChain
    ],
    // Default Fallback: General
    generalChain
  ]);

  // 4. Create the Full Coordinated Chain
  const fullChain = RunnableSequence.from([
    // Step 1: Run the classification and keep the original question
    {
      topic: classificationChain,             // This extracts "math", "biology", etc based on the question
      question: (input) => input.question     // This just passes the original question string straight through
    },
    // Step 2: Route passing down the context {topic, question}
    routingBranch 
  ]);

  // 5. Test the routing logic with a variety of questions
  const questions = [
    "What is the square root of 144 plus 12?",
    "How does photosynthesis work in a cactus?",
    "When was the Eiffel Tower built?"
  ];

  for (const q of questions) {
    console.log(`\n======================================`);
    console.log(`User asked: "${q}"`);
    console.log(`======================================`);
    
    // We invoke the single 'fullChain', and LangChain handles the classification + routing + execution seamlessly
    const answer = await fullChain.invoke({ question: q });
    console.log(`Answer:\n${answer}\n`);
  }
}

runRoutingChain().catch(console.error);
