import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

/**
 * Root API Router
 * All routes are prefixed with /api in app.js.
 *
 * /api/auth  → Authentication (register, login, OAuth, refresh, logout, me)
 * /api/users → User specifics (bookmarks, profile)
 * /api/posts → Blog posts (CRUD, public feed, dashboard)
 * /api/uploads → Image uploads (Cloudinary)
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/uploads', uploadRoutes);

/**
 * GET /api/health
 * Simple health check endpoint.
 * Useful for load balancers, Docker HEALTHCHECK, and Postman smoke tests.
 */
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Engineering Blog API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

export default router;
