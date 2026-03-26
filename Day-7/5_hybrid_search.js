import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";

dotenv.config();

// ============================================================================
// DAY 7: ADVANCED RETRIEVAL - HYBRID SEARCH
// ============================================================================
// Concept: Pure Vector/Semantic Search is sometimes bad at finding exact
// keyword matches (like specific IDs or names). Traditional Keyword Search
// is bad at context.
// Solution: Hybrid Search combines both into a custom Retriever!
// ============================================================================

// 1. Create a minimal custom Keyword Retriever
// This simulates algorithms like BM25 which look for exact word matches.
class CustomKeywordRetriever extends BaseRetriever {
  lc_namespace = ["langchain", "retrievers", "custom_keyword"];

  constructor(documents) {
    super();
    this.documents = documents;
  }

  // Mandatory method when extending BaseRetriever
  async _getRelevantDocuments(query) {
    // Simple logic: If the exact query string is inside the document, return it
    const lowerQuery = query.toLowerCase();
    const matches = this.documents.filter(doc =>
      doc.pageContent.toLowerCase().includes(lowerQuery)
    );
    return matches;
  }
}

// 2. We build our own Hybrid Retriever to merge the results of both!
class CustomHybridRetriever extends BaseRetriever {
  lc_namespace = ["langchain", "retrievers", "custom_hybrid"];

  constructor(semanticRetriever, keywordRetriever) {
    super();
    this.semanticRetriever = semanticRetriever;
    this.keywordRetriever = keywordRetriever;
  }

  async _getRelevantDocuments(query) {
    // Run both retrievers at the exact same time
    const [semanticDocs, keywordDocs] = await Promise.all([
      this.semanticRetriever.invoke(query),
      this.keywordRetriever.invoke(query)
    ]);

    // Merge them together
    const allDocs = [...semanticDocs, ...keywordDocs];

    // Deduplicate the combined results based on their content
    const uniqueDocsMap = new Map();
    allDocs.forEach(doc => {
      uniqueDocsMap.set(doc.pageContent, doc);
    });

    return Array.from(uniqueDocsMap.values());
  }
}

async function runHybridSearch() {
  console.log("Starting Custom Hybrid Search Example...\n");

  const sampleDocs = [
    new Document({ pageContent: "The majestic eagle flies high in the sky.", metadata: { id: 1 } }),
    new Document({ pageContent: "Employee ID RX-782 is assigned to the new tech lead.", metadata: { id: 2 } }),
    new Document({ pageContent: "Airplanes use jet engines to achieve flight.", metadata: { id: 3 } })
  ];

  console.log("Initializing Vector Store (Semantic)...");
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "text-embedding-004", 
  });

  try {
    const vectorStore = await Chroma.fromDocuments(sampleDocs, embeddings, {
      collectionName: "hybrid_demo_collection",
    });
    const semanticRetriever = vectorStore.asRetriever(2);

    console.log("Initializing Keyword Retriever (Exact Match)...");
    const keywordRetriever = new CustomKeywordRetriever(sampleDocs);

    // Combine them into our Custom Hybrid Retriever!
    const hybridRetriever = new CustomHybridRetriever(semanticRetriever, keywordRetriever);

    const q1 = "Tell me about flying animals.";
    const q2 = "RX-782";

    console.log(`\n======================================`);
    console.log(`Query 1: "${q1}"`);
    console.log(`======================================`);
    const hybridResults1 = await hybridRetriever.invoke(q1);
    console.log("Top Hybrid Result:");
    if (hybridResults1.length > 0) console.log(hybridResults1[0].pageContent);

    console.log(`\n======================================`);
    console.log(`Query 2: "${q2}"`);
    console.log(`======================================`);
    const hybridResults2 = await hybridRetriever.invoke(q2);
    console.log("Top Hybrid Result:");
    if (hybridResults2.length > 0) console.log(hybridResults2[0].pageContent);

  } catch (err) {
    if (err.message && err.message.includes("Failed to connect")) {
      console.log("\n⚠️  NOTE: Hybrid Search requires your local ChromaDB server to be running!");
      console.log("Please start your Chroma DB (e.g., docker run -p 8000:8000 chromadb/chroma) and try again.");
    } else {
      console.error(err);
    }
  }
}

runHybridSearch().catch(console.error);
