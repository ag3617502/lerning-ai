const mongoose = require("mongoose");

const conversationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      default: "New Chat",
    },
    documentProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Will provide createdAt and updatedAt (for sorting by last updated)
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
