/**
 * checkRole — Role-Based Authorization Middleware (Factory)
 *
 * Returns a middleware that only allows users whose role
 * is included in the `allowedRoles` array.
 *
 * Must be used AFTER verifyToken (req.user must be populated).
 *
 * Usage:
 *   router.delete('/:id', verifyToken, checkRole(['CREATOR']), controller)
 *   router.get('/admin', verifyToken, checkRole(['ADMIN', 'CREATOR']), controller)
 */
export const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required role: ${allowedRoles.join(' or ')}.`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};
