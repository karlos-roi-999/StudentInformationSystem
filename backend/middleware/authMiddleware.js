const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET

// Verify that the request has a valid JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
}

// Checks if user has the required role (SuperAdmin passes all checks)
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated.' });
        }

        if (req.user.role === 'SuperAdmin' || allowedRoles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    };
}

module.exports = { verifyToken, requireRole };
