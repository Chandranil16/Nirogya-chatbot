const auth = require("../middlewares/auth");
const { getchatresponse,getUserChats,deleteChat,deleteAllChats,getChatConversations } = require("../controllers/Chatcontroller");
const router = require("express").Router();

// Existing chat generation route
router.post("/generate", auth, getchatresponse);
// route to get chat history
router.get("/history", auth, getUserChats);

// routes for chat management
router.get("/conversations", auth, getChatConversations);
router.delete("/chat/:chatId", auth, deleteChat); //specific chat
router.delete("/all", auth, deleteAllChats);   //allchat
module.exports = router;