import { ChromaClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

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

const dummyEmbeddingFunction = {
    generate: async (texts) => texts.map(() => new Array(768).fill(0)), // Gemini embedding size is 768
};

export const getCollection = async (collectionName) => {
    return await client.getOrCreateCollection({
        name: collectionName,
        embeddingFunction: dummyEmbeddingFunction,
    });
};

export default client;
