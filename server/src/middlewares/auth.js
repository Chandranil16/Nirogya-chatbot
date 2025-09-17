require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/Usermodel"); 

const auth = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the complete user from database
    const user = await User.findById(decoded.id || decoded._id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    req.user = user; 
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
