require('dotenv').config();
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise'); // Using promise-based MySQL

// MongoDB Setup
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("❌ MongoDB URI is missing. Check your .env file.");
    process.exit(1);
}

const mongoClient = new MongoClient(mongoUri);

async function connectMongoDB() {
    try {
        await mongoClient.connect();
        console.log("✅ Connected to MongoDB");
        return mongoClient.db();  // Returns the MongoDB database instance
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
}

// MySQL Setup
const mysqlConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
};

let mysqlConnection;

async function connectMySQL() {
    try {
        mysqlConnection = await mysql.createConnection(mysqlConfig);
        console.log("✅ Connected to MySQL");
        return mysqlConnection;
    } catch (error) {
        console.error("❌ MySQL connection error:", error);
        process.exit(1);
    }
}

module.exports = { connectMongoDB, connectMySQL };
