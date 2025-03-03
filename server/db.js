require('dotenv').config();  // Load environment variables

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;  // Read connection string from .env

if (!uri) {
    console.error("❌ MongoDB URI is missing. Check your .env file.");
    process.exit(1);  // Stop execution if URI is missing
}

const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

connectDB();

module.exports = client;
