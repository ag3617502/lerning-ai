const express = require("express");
const { protect } = require("../middlewares/authMiddleware");

const { getMessages, sendMessage } = require("../controllers/chatController");

const router = express.Router();

// Fetch all messages for a conversation
router.get("/:conversationId", protect, getMessages);

// Send a new message
router.post("/", protect, sendMessage);

module.exports = router;
