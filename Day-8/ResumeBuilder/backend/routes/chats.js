// ============================================================
// CHAT ROUTES — CRUD for saved resume chat sessions
// ============================================================
import express from "express";
import Chat from "../models/Chat.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require auth
router.use(protect);

// GET /api/chats — list all chats for this user (sidebar)
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select("title phase isComplete resumeData.selectedTemplate createdAt updatedAt")
      .lean();

    res.json({ chats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chats/:id — load a full chat (to restore a session)
router.get("/:id", async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chats — create a new blank chat
router.post("/", async (req, res) => {
  try {
    const chat = await Chat.create({ userId: req.user._id, title: "New Resume" });
    res.status(201).json({ chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chats/:id — delete a chat
router.delete("/:id", async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
