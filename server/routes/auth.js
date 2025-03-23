const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto"); // ✅ Required for reset tokens
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Signup Route (MySQL)
router.post(
    "/signup",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;
        const mysql = req.app.locals.mysql;

        try {
            // ✅ Check if user exists
            const [existingUser] = await mysql.execute("SELECT id FROM users WHERE email = ?", [email]);

            if (existingUser.length > 0) {
                return res.status(400).json({ message: "Email already registered" });
            }

            // ✅ Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ Insert user into MySQL
            const [result] = await mysql.execute(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                [name, email, hashedPassword]
            );

            const userId = result.insertId; // ✅ Get the inserted user ID

            res.status(201).json({ message: "User registered successfully!", userId });
        } catch (err) {
            console.error("❌ Signup Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ✅ Login Route (MySQL Sessions)
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const mysql = req.app.locals.mysql;

        try {
            // ✅ Check if user exists
            const [userRows] = await mysql.execute("SELECT * FROM users WHERE email = ?", [email]);

            if (userRows.length === 0) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const user = userRows[0];

            // ✅ Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // ✅ Store session in MySQL with user_id
            req.session.user = { id: user.id, email: user.email };

            res.json({ message: "Login successful", user: req.session.user, sessionId: req.sessionID });
        } catch (err) {
            console.error("❌ Login Error:", err);
            res.status(500).json({ message: "Server error" });
        }
    }
);

// ✅ Logout Route
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: "Logout failed" });
        res.json({ message: "Logout successful" });
    });
});

// ✅ Profile Route (Requires Session)
router.get("/profile", authMiddleware, async (req, res) => {
    const mysql = req.app.locals.mysql;

    try {
        const [user] = await mysql.execute("SELECT id, name, email FROM users WHERE id = ?", [req.session.user.id]);

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user[0]); // ✅ Return user profile
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Forgot Password (Reset Link via Email)
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const mysql = req.app.locals.mysql;

    try {
        console.log("🔹 Forgot Password Requested for:", email);

        // ✅ Check if the user exists
        const [userRows] = await mysql.execute("SELECT id FROM users WHERE email = ?", [email]);

        if (userRows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = userRows[0];

        // ✅ Generate a reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        // ✅ Save the reset token in the database
        await mysql.execute("UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?", 
                            [resetToken, expiresAt, user.id]);

        // ✅ Log token and expiration
        console.log("🔹 Generated Reset Token:", resetToken);
        console.log("🔹 Token Expiry:", expiresAt);

        // ✅ Send the email
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        console.log("🔹 Reset Link:", resetLink);

        req.app.locals.transporter.sendMail({
            
            to: email,
            subject: "Password Reset Request",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h2>Hello ${user.name},</h2>
                <p>We received a request to reset your password.</p>
                <p>If this was you, click the button below to reset your password:</p>
                <a href="http://localhost:3000/reset-password?token=${resetToken}" 
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Reset Password
                </a>
                <p style="margin-top: 20px;">If you didn't request this, <a href="http://localhost:3000/report">click here to report</a>.</p>
                <p style="font-size: 12px; color: gray;">If you have any issues, please contact our support team.</p>
              </div>
            `
          });

        res.json({ message: "Password reset link sent to email" });
    } catch (err) {
        console.error("❌ Forgot Password Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ OTP for Password Reset
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    const mysql = req.app.locals.mysql;

    try {
        const [userRows] = await mysql.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (userRows.length === 0) {
            return res.status(400).json({ message: "Email not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 mins

        await mysql.execute("UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?", 
                            [otp, otpExpires, email]);

        req.app.locals.transporter.sendMail({
            to: email,
            subject: "Your OTP for Password Reset",
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
        });

        res.json({ message: "OTP sent successfully." });

    } catch (err) {
        console.error("❌ OTP Sending Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
