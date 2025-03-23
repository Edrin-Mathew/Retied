const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const { connectMongoDB, connectMySQL } = require("./db"); // ✅ Import both databases
const authRoutes = require("./routes/auth"); // ✅ Import authentication routes
const resetPasswordRoutes = require("./routes/resetPassword"); // ✅ Import reset password routes
require("dotenv").config(); // ✅ Load environment variables
const fs = require("fs"); // ✅ Required to read JSON files
const nodemailer = require("nodemailer");

const cors = require("cors"); // ✅ Import CORS middleware

app.use(cors({
    origin: ["https://retied.vercel.app", "http://localhost:3000"], // ✅ Allow frontend origins
    credentials: true, // ✅ Allow sending cookies (for sessions)
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allow required methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow required headers
}));



const authMiddleware = require("./middlewares/authMiddleware");

// Protect profile route
app.get("/auth/profile", authMiddleware, (req, res) => {
    res.json({ success: true, user: req.session.user });
});


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // ✅ Enable JSON parsing

// ✅ Initialize Nodemailer Transporter Before Routes
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ✅ Store transporter in app.locals so it can be accessed in routes
app.locals.transporter = transporter;


// ✅ Connect to MySQL and MongoDB before starting the server
Promise.all([connectMongoDB(), connectMySQL()])
    .then(([mongoDB, mysqlConnection]) => {
        if (!mongoDB || !mysqlConnection) {
            console.error("❌ Database connection failed!");
            process.exit(1);
        }

        app.locals.mongoDB = mongoDB; // ✅ Store MongoDB reference (if needed later)
        app.locals.mysql = mysqlConnection; // ✅ Store MySQL reference

        // ✅ Configure MySQL session store
        const sessionStore = new MySQLStore({}, mysqlConnection);

        app.use(session({
            key: "session_id",
            secret: process.env.SESSION_SECRET || "supersecretkey",
            store: sessionStore,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false, // Set to true if using HTTPS
                httpOnly: true,
                maxAge: 1000 * 60 * 60 // 1 hour
            }
        }));


        const cors = require("cors"); // ✅ Import CORS
app.use(cors({ origin: "https://retied.vercel.app", credentials: true }));

        // ✅ Authentication Routes (Signup, Login, Logout, Profile)
        console.log("✅ Authentication routes loaded...");
        app.use("/auth", authRoutes);

        // ✅ Reset Password Routes (Forgot Password, OTP, etc.)
        console.log("✅ Reset password routes loaded...");
        app.use("/reset", resetPasswordRoutes);

        // ✅ Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Error connecting to database:", error);
        process.exit(1);
    });

// ✅ Route to Serve Products from JSON (If Needed)
app.get('/api/products', (req, res) => {
    try {
        const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));
        res.json(products);
    } catch (error) {
        console.error("❌ Error reading products.json:", error);
        res.status(500).json({ message: "Failed to load products" });
    }
});

app.get("/auth/session", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error logging out" });
        }
        res.json({ success: true, message: "Logged out successfully" });
    });
});

