require('dotenv').config(); 
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;  

if (!uri) {
    console.error("❌ MongoDB URI is missing. Check your .env file.");
    process.exit(1);  
}

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        return client.db();  // Returns the database instance
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

module.exports = connectDB;  // ✅ Exporting the function
