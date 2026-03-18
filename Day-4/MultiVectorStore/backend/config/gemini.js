import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

/**
 * Generates an embedding for a given text using Gemini.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
export const generateEmbedding = async (text) => {
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Error generating embedding:", error);
        throw error;
    }
};

/**
 * Generates embeddings for an array of texts using Gemini batch API.
 * @param {string[]} texts - Array of texts to embed.
 * @returns {Promise<number[][]>} - Array of embedding vectors.
 */
export const generateBatchEmbeddings = async (texts) => {
    try {
        const result = await model.batchEmbedContents({
            requests: texts.map((t) => ({ content: { role: "user", parts: [{ text: t }] } })),
        });
        return result.embeddings.map(e => e.values);
    } catch (error) {
        console.error("Error generating batch embeddings:", error);
        throw error;
    }
};

export default genAI;
