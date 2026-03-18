import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: "New Chat"
    },
    phrases: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
