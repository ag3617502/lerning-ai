const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatGroq } = require("@langchain/groq");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

// Initialize Embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-embedding-001",
});

const { ChromaClient, CloudClient } = require("chromadb");

const getChromaArgs = () => {
  // Use CloudClient if we have tenant ID but no custom URL.
  // CloudClient automatically resolves the Chroma cluster URL for hosted tenants.
  if (process.env.CHROME_TENANT_ID && process.env.CHROMA_API_KEY && !process.env.CHROMA_URL) {
    const client = new CloudClient({
      tenant: process.env.CHROME_TENANT_ID,
      database: process.env.CHROME_DATABASE,
      apiKey: process.env.CHROMA_API_KEY,
    });
    return {
      collectionName: "document_chat",
      index: client,
    };
  } else {
    // Fallback for Custom URL or Localhost
    const fetchOptions = process.env.CHROMA_API_KEY ? {
      headers: {
        "Authorization": `Bearer ${process.env.CHROMA_API_KEY}`,
        "x-api-key": process.env.CHROMA_API_KEY,
        "x-chroma-token": process.env.CHROMA_API_KEY
      }
    } : {};

    const client = new ChromaClient({
      path: process.env.CHROMA_URL || "http://localhost:8000",
      ...(process.env.CHROME_TENANT_ID && { tenant: process.env.CHROME_TENANT_ID }),
      ...(process.env.CHROME_DATABASE && { database: process.env.CHROME_DATABASE }),
      fetchOptions
    });

    return {
      collectionName: "document_chat",
      index: client,
    };
  }
};

const processDocument = async (filePath, conversationId) => {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    let splitDocs = await splitter.splitDocuments(docs);
    // Strict filter: Drop chunks that are purely punctuation/whitespace to prevent empty embeddings
    splitDocs = splitDocs.filter((doc) => {
      const text = doc.pageContent || "";
      // Must have some actual letters or numbers to be vectorizable
      return text.trim().length > 5 && /[a-zA-Z0-9]/.test(text);
    });

    if (splitDocs.length === 0) {
      throw new Error("No readable text could be extracted from this document. It may be an image-based PDF or empty.");
    }

    // Add conversation ID to metadata for filtering later
    // Chroma strictly requires that all metadata values are strings, numbers, or booleans.
    const docsWithMetadata = splitDocs.map((doc) => {
      const cleanMetadata = { ...doc.metadata };
      
      // Remove nested objects added by loaders
      if (cleanMetadata.pdf) delete cleanMetadata.pdf;
      if (cleanMetadata.loc) delete cleanMetadata.loc;

      // Ensure any other stray objects are converted to strings
      for (const key in cleanMetadata) {
        if (typeof cleanMetadata[key] === "object" && cleanMetadata[key] !== null) {
          cleanMetadata[key] = JSON.stringify(cleanMetadata[key]);
        }
      }

      return {
        ...doc,
        metadata: { ...cleanMetadata, conversationId: conversationId.toString() },
      };
    });

    const vectorStore = new Chroma(embeddings, getChromaArgs());
    await vectorStore.addDocuments(docsWithMetadata);
    
    return docsWithMetadata.length;
};

const askQuestion = async (conversationId, question, chatHistory) => {
    const vectorStore = new Chroma(embeddings, getChromaArgs());
    
    const retriever = vectorStore.asRetriever({
      filter: { conversationId: conversationId.toString() }
    });

    const llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEYS, 
      model: "openai/gpt-oss-120b", 
      temperature: 0.2,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", "You are a helpful assistant. Use the following context to answer the question.\\nContext:\\n{context}"],
      ["human", "{input}"]
    ]);

    const combineDocs = (docs) => docs.map((doc) => doc.pageContent).join("\n\n");

    const retrievalChain = RunnableSequence.from([
      {
        context: async (input) => {
          // input.input comes from invoke({ input: question })
          const docs = await retriever.invoke(input.input);
          return combineDocs(docs);
        },
        input: (input) => input.input,
      },
      promptTemplate,
      llm,
      new StringOutputParser(),
    ]);

    const answer = await retrievalChain.invoke({
      input: question,
    });

    return answer;
};

module.exports = { processDocument, askQuestion };
