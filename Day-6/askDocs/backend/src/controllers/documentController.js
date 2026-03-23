const fs = require("fs");
const Conversation = require("../models/Conversation");
const { processDocument } = require("../services/langchainService");

const uploadDocument = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: "No document provided" });
    }

    const filePath = req.file.path;
    
    console.log(`Processing file: ${filePath} for conversation: ${conversationId}`);
    
    const chunkCount = await processDocument(filePath, conversationId);
    
    // Mark conversation as having a document
    await Conversation.findByIdAndUpdate(conversationId, { documentProcessed: true, updatedAt: Date.now() });
    
    // Delete the file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({ message: "Document processed and embeddings saved successfully", chunks: chunkCount });
  } catch (error) {
    console.error("Upload Error:", error);
    
    // Automatically purge the physical file if any error occurred during embedding
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument };
