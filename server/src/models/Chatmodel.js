const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    userMessage: { type: String, required: true },
    userMessageTime: { type: Date, required: true },
    botReply: { type: String, required: true },
    botReplyTime: { type: Date, required: true },
    conversationId: { type: String, required: true }, // This field is crucial
  },
  { timestamps: true }
);

// Indexes for better query performance
ChatSchema.index({ username: 1, conversationId: 1, userMessageTime: 1 });
ChatSchema.index({ username: 1, userMessageTime: 1 });

module.exports = mongoose.model("Chat", ChatSchema);
