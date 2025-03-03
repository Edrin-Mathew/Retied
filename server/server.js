const express = require("express");
const connectDB = require("./db"); // Import the database connection

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Enable JSON parsing

// Connect to MongoDB before starting the server
connectDB().then((db) => {
    app.locals.db = db; // Store DB reference in app.locals

    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});
