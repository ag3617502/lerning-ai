const express = require("express");
const { protect } = require("../middlewares/authMiddleware");

const { getConversations, createConversation } = require("../controllers/conversationController");

const router = express.Router();

// Fetch all conversations for the user
router.get("/", protect, getConversations);

// Create a new conversation
router.post("/", protect, createConversation);

module.exports = router;
