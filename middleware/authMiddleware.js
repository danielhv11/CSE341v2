// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, 'your_secret_key', (err, user) => { // Replace 'your_secret_key' with your actual secret
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user; // Store user info in request
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = authenticateToken;
