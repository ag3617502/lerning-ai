import { generateEmbedding, generateBatchEmbeddings } from "../config/gemini.js";
import { getCollection } from "../config/chroma.js";
import { v4 as uuidv4 } from "uuid";
import Chat from "../models/Chat.js";

/**
 * Create a new chat session.
 */
export const createChat = async (req, res) => {
    try {
        const { title } = req.body;
        const newChat = new Chat({ title: title || "New Chat" });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get all chat sessions.
 */
export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find().sort({ createdAt: -1 });
        res.status(200).json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Get a specific chat session by ID.
 */
export const getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: "Chat not found" });
        res.status(200).json(chat);
    } catch (error) {
        console.error("Error fetching chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * Process an array of strings for a specific chat: generate embeddings and save to ChromaDB with chatId.
 */
export const processStrings = async (req, res) => {
    try {
        const { strings, chatId, collectionName = "user_data" } = req.body;

        if (!chatId) return res.status(400).json({ message: "chatId is required." });
        if (!Array.isArray(strings) || strings.length === 0) {
            return res.status(400).json({ message: "Invalid input: strings must be a non-empty array." });
        }

        // Update MongoDB Chat with new phrases
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found." });
        
        // Add new unique phrases only
        const newPhrases = strings.filter(s => !chat.phrases.includes(s));
        if (newPhrases.length === 0) {
            return res.status(200).json({ message: "All phrases already synced.", chat });
        }

        chat.phrases = [...new Set([...chat.phrases, ...strings])];
        await chat.save();

        const collection = await getCollection(collectionName);

        // Generate embeddings for new phrases in one batch request
        const embeddings = await generateBatchEmbeddings(newPhrases);
        const ids = newPhrases.map(() => uuidv4());
        const metadatas = newPhrases.map(() => ({ chatId })); // Add chatId to metadata

        await collection.add({
            ids,
            embeddings,
            documents: newPhrases,
            metadatas
        });

        res.status(200).json({ 
            message: "Embeddings generated and saved successfully.",
            count: newPhrases.length,
            chat
        });
    } catch (error) {
        console.error("Error processing strings:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

/**
 * Search for the best match for a query within a specific chat session.
 */
export const searchEmbeddings = async (req, res) => {
    try {
        const { query, chatId, collectionName = "user_data", nResults = 1 } = req.body;

        if (!chatId) return res.status(400).json({ message: "chatId is required." });
        if (!query) return res.status(400).json({ message: "Query text is required." });

        const collection = await getCollection(collectionName);
        const queryEmbedding = await generateEmbedding(query);

        // Query with metadata filter for chatId
        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: nResults,
            where: { "chatId": chatId } // Isolation logic
        });

        if (!results.documents || results.documents[0].length === 0) {
            return res.status(200).json({ matches: [], message: "No matches found for this chat." });
        }

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
