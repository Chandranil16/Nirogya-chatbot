require('dotenv').config()
const express=require("express")

const app=express()
const cors=require("cors")
const mongoconnect= require("./config/Db")
const cookieParser = require("cookie-parser");

const userrouter=require("./routes/Userroute")
const chatrouter=require("./routes/Chatroute")
mongoconnect()
app.use(cookieParser())
app.use(cors({origin: "https://nirogya-chatbot.onrender.com", credentials: true, allowedHeaders: "*"}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/api/auth",userrouter)
app.use("/api/chat",chatrouter)

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})
