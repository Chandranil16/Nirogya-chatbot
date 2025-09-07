const auth = require("../middlewares/auth");
const { getchatresponse } = require("../controllers/Chatcontroller");
const router = require("express").Router();

// Existing chat generation route
router.post("/generate", auth, getchatresponse);

module.exports = router;