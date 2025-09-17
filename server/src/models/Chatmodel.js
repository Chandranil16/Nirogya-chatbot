const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    userMessage: { type: String, required: true },
    userMessageTime: { type: Date, required: true },
    botReply: { type: String, required: true },
    botReplyTime: { type: Date, required: true },
    conversationId: { type: String, required: true }, // For grouping related chats
    sessionId: { type: String, required: true } // For session-based grouping
  },
  { timestamps: true }
);

// Index for better query performance
ChatSchema.index({ username: 1, userMessageTime: 1 });
ChatSchema.index({ username: 1, conversationId: 1 });


module.exports = mongoose.model("Chat", ChatSchema);
