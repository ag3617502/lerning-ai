const express = require('express');
const { chat, getConversations, getMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * Routes for chat and conversation management.
 * All these routes are PROTECTED (require a valid JWT token).
 * The 'protect' middleware ensures req.user is populated.
 */

// POST /api/chat -> Send a message to AI (streaming)
router.post('/', protect, chat);

// GET /api/conversations -> Fetch all conversations for the user
router.get('/conversations', protect, getConversations);

// GET /api/conversations/:id/messages -> Fetch messages for a specific chat
router.get('/conversations/:id/messages', protect, getMessages);

module.exports = router;
