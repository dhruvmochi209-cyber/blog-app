import { verifyAccessToken } from '../utils/jwt.utils.js';

/**
 * verifyToken — Authentication Middleware
 *
 * Extracts the Bearer JWT from the Authorization header,
 * verifies its signature, and attaches the decoded payload
 * to `req.user` so downstream middleware and controllers
 * can access the authenticated user's id and role without
 * hitting the database.
 *
 * Usage:
 *   router.get('/protected', verifyToken, controller)
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token is malformed.',
      });
    }

    // verifyAccessToken throws on invalid/expired token
    const decoded = verifyAccessToken(token);

    // Attach the decoded payload as req.user
    // Shape: { sub: userId, role: 'VISITOR'|'CREATOR', email }
    req.user = {
      _id: decoded.sub,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your session.',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};
