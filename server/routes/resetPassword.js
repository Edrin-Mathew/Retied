const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const router = express.Router();

// ✅ Step 1: User Requests Password Reset
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const mysql = req.app.locals.mysql;

    try {
        // ✅ Check if the email exists
        const [userRows] = await mysql.execute("SELECT * FROM users WHERE email = ?", [email]);

        if (userRows.length === 0) {
            return res.status(400).json({ message: "Email not found" });
        }

        const user = userRows[0];

        // ✅ Generate a secure reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // Expires in 15 mins

        // ✅ Store the token in the database
        await mysql.execute(
            "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
            [resetToken, resetExpires, email]
        );

        // ✅ Send reset email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // **✅ Add email to the reset link**
        const resetLink = `http://localhost:3000/reset-password.html?token=${resetToken}&email=${email}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `
                <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
                <a href="${resetLink}">${resetLink}</a>
            `,
        });

        res.json({ message: "Password reset link sent!" });

    } catch (err) {
        console.error("❌ Forgot Password Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Step 2: Reset Password Using Token
router.post("/reset-password", async (req, res) => {
    const { token, email, newPassword } = req.body;
    const mysql = req.app.locals.mysql;

    try {
        // ✅ Check if the token exists and is not expired
        const [userRows] = await mysql.execute(
            "SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_expires > NOW()",
            [email, token]
        );

        if (userRows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const user = userRows[0];

        // ✅ Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // ✅ Update the password & remove the reset token
        await mysql.execute(
            "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?",
            [hashedPassword, user.id]
        );

        // ✅ Destroy session after password reset (security best practice)
        if (req.session) {
            req.session.destroy();
        }

        res.json({ message: "Password reset successful! You can now log in with your new password." });

    } catch (err) {
        console.error("❌ Reset Password Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
