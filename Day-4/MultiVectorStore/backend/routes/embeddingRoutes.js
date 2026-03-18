import express from "express";
import { processStrings, searchEmbeddings, createChat, getChats, getChatById } from "../controllers/embeddingController.js";

const router = express.Router();

// Chat Management
router.post("/chats", createChat);
router.get("/chats", getChats);
router.get("/chats/:id", getChatById);

// Embedding Operations
router.post("/process", processStrings);
router.post("/search", searchEmbeddings);

export default router;
