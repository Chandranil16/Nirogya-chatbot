const User = require("../models/Usermodel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(401).json({ message: "All fields are required" });
    }
    const user = await User.create({
      username,
      email,
      password,
    });

    if (!user) {
      return res.status(401).json({ message: "User registration failed" });
    }
    console.log("User registered:", user);
    res.status(200).json({
      message: "User registered successfully",
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
        const user = await User.findOne({ email });

    const ismatch=await bcrypt.compare(password, user.password);
    if(!ismatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

   const token=jwt.sign({_id: user._id}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none", // or "none" if using HTTPS
      secure: true,   // true if using HTTPS
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(200).json({
      success: true, token, user: { _id: user._id, username: user.username, email: user.email }
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


exports.logout=async(req,res)=>{
  try {
    res.clearCookie("token",{
      httpOnly: true,
      sameSite: "lax", // or "none" if using HTTPS
      secure: false,   // true if using HTTPS
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

exports.getme=async(req,res)=>{
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(200).json({ user: { _id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}



