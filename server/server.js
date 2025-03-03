const express = require("express");
const connectDB = require("./db"); // ✅ Import database connection

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Enable JSON parsing

// Connect to MongoDB before starting the server
connectDB().then((db) => {
    if (!db) {
        console.error("❌ Database connection failed!");
        process.exit(1);
    }

    app.locals.db = db; // ✅ Store DB reference in app.locals

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("❌ Error connecting to database:", error);
    process.exit(1);
});
