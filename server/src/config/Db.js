const mongoose = require('mongoose');

const mongoconnect=async()=>{
    try {
        const connection=await mongoose.connect(process.env.MONGO_URL)
        console.log("Database connected successfully:", connection.connection.port);
    }catch (error) {
        console.log("Database connection failed:", error.message);
        
    }
}

module.exports = mongoconnect;
