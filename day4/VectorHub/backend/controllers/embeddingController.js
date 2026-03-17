import { generateEmbedding, generateBatchEmbeddings } from "../config/gemini.js";
import { getCollection } from "../config/chroma.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Process an array of strings: generate embeddings and save to ChromaDB.
 */
export const processStrings = async (req, res) => {
    try {
        const { strings, collectionName = "user_data" } = req.body;

        if (!Array.isArray(strings) || strings.length === 0) {
            return res.status(400).json({ message: "Invalid input: strings must be a non-empty array." });
        }

        const collection = await getCollection(collectionName);

        // Generate all embeddings in one batch request
        const embeddings = await generateBatchEmbeddings(strings);
        const ids = strings.map(() => uuidv4());

        await collection.add({
            ids,
            embeddings,
            documents: strings,
        });

        res.status(200).json({ 
            message: "Embeddings generated and saved successfully.",
            count: strings.length 
        });
    } catch (error) {
        console.error("Error processing strings:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * Search for the best match for a query within the provided collection.
 */
export const searchEmbeddings = async (req, res) => {
    try {
        const { query, collectionName = "user_data", nResults = 1 } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Query text is required." });
        }

        const collection = await getCollection(collectionName);
        const queryEmbedding = await generateEmbedding(query);

        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: nResults,
        });

        // Format results for the frontend
        const matches = results.documents[0].map((doc, index) => ({
            text: doc,
            metadata: results.metadatas[0] ? results.metadatas[0][index] : null,
            distance: results.distances[0][index]
        }));

        res.status(200).json({ matches });
    } catch (error) {
        console.error("Error searching embeddings:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
