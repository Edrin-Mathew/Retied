// Desc: Middleware to check if user is logged in

module.exports = function (req, res, next) {
    if (!req.session || !req.session.user) {
        console.warn("❌ Unauthorized access attempt:", req.originalUrl);
        return res.status(401).json({ success: false, message: "Access denied. Please log in." });
    }
    next();
};
