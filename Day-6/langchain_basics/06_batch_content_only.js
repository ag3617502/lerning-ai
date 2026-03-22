// File: 06_batch_content_only.js
// Purpose: Demonstrate chaining a StringOutputParser so that batch output yields just strings (content) instead of complex objects.

require('dotenv').config();
const { ChatGroq } = require('@langchain/groq');
const { StringOutputParser } = require('@langchain/core/output_parsers');

async function run() {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEYS, 
    model: 'llama-3.1-8b-instant',
  });

  // A parser translates AIMessage into a normal JavaScript string (just the content)
  const parser = new StringOutputParser();
  
  // We use the pipe (|) operator in logic to create a RunnableSequence
  // Input flows through the model, and the model's output flows into the parser.
  const chain = model.pipe(parser);

  console.log("Sending multiple questions, but automatically extracting pure content...\n");

  const questions = [
    "Identify the color of a ripe banana in one word.",
    "Identify the number of legs a spider has.",
    "Identify the freezing point of water in Celsius.",
    "Identify the sound a cow makes in one word."
  ];

  // Because we call .batch() on the chain, every response is automatically parsed
  // The result is purely an array of strings!
  const results = await chain.batch(questions);

  console.log("=== Clean String Outputs ===");
  console.log(results); // Just an array of strings!
  
  console.log("\nFormatted Display:");
  results.forEach((text, i) => {
    console.log(`Q: ${questions[i]}\nA: ${text}\n`);
  });
}

run().catch(console.error);
