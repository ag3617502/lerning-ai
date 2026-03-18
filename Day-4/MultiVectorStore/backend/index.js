import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChromaClient } from "chromadb";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

const client = new ChromaClient({
    host: "api.trychroma.com",
    port: 443,
    ssl: true,
    tenant: process.env.CHROME_TENANT_ID,
    database: process.env.CHROME_DATABASE || "default_database",
    headers: {
        "X-Chroma-Token": process.env.CHROMA_API_KEY,
    }
});

/**
 * Dummy embedding function to satisfy ChromaDB requirements when we provide vectors manually.
 */
const dummyEmbeddingFunction = {
    generate: async (texts) => texts.map(() => new Array(1536).fill(0)),
};

/**
 * Generates an embedding for a given text using Gemini.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
async function generateEmbedding(text) {
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
}

/**
 * Adds a document and its embedding to ChromaDB.
 * @param {string} collectionName - The name of the collection.
 * @param {string} text - The document text.
 * @param {object} metadata - Optional metadata.
 */
async function addToVectorDB(collectionName, text, metadata = {}) {
    try {
        const collection = await client.getOrCreateCollection({
            name: collectionName,
            embeddingFunction: dummyEmbeddingFunction,
        });

        const embedding = await generateEmbedding(text);
        const id = uuidv4();
        console.log(`Generated embedding for: "${text.substring(0, 30)}..."`);
        
        await collection.add({
            ids: [id],
            embeddings: [embedding],
            metadatas: [metadata],
            documents: [text],
        });

        console.log(`Document added with ID: ${id}`);
        return id;
    } catch (error) {
        console.error("Error adding to vector DB:", error);
        throw error;
    }
}

/**
 * Searches for similar documents in ChromaDB.
 * @param {string} collectionName - The name of the collection.
 * @param {string} queryText - The text to search for.
 * @param {number} nResults - Number of results to return.
 */
async function searchVectorDB(collectionName, queryText, nResults = 1) {
    try {
        const collection = await client.getOrCreateCollection({
            name: collectionName,
            embeddingFunction: dummyEmbeddingFunction,
        });

        const queryEmbedding = await generateEmbedding(queryText);

        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: nResults,
        });

        return results;
    } catch (error) {
        console.error("Error searching vector DB:", error);
        throw error;
    }
}

// Example usage
async function main() {
    const collectionName = "my_collection";

    try {
        console.log("Adding documents...");
        // await addToVectorDB(collectionName, "The capital of France is Paris.", { topic: "geography" });
        // await addToVectorDB(collectionName, "The sun is a star.", { topic: "science" });

        console.log("\nSearching for 'What is sun?'...");
        const searchResults = await searchVectorDB(collectionName, "What is sun?");
        
        console.log("\nSearch Results:");
        console.log(JSON.stringify(searchResults, null, 2));
    } catch (error) {
        console.error("Main execution error:", error);
    }
}

main().catch(console.error);
