const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { askQuestion } = require("../services/langchainService");

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    
    // Save user message
    const userMessage = await Message.create({
      conversationId,
      sender: "user",
      text,
    });

    // Update conversation updatedAt
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: Date.now() });

    // Call Langchain service to get AI response using history/chromadb
    const aiResponseText = await askQuestion(conversationId, text, []); // passing empty history for now
    
    // Save AI message
    const aiMessage = await Message.create({
      conversationId,
      sender: "ai",
      text: aiResponseText,
    });

    res.status(201).json({ userMessage, aiMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage };
