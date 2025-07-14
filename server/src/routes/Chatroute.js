const auth=require("../middlewares/auth");

const {getchatresponse}=require("../controllers/Chatcontroller");
const router = require("express").Router();

router.post("/generate", auth, getchatresponse);
module.exports = router;


