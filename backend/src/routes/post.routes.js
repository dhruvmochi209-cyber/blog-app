import { Router } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils.js';
import {
  getAllPublished,
  getBySlug,
  getMyPosts,
  createPost,
  updatePost,
  deletePost,
  toggleStatus,
  getCategories,
} from '../controllers/post.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  toggleStatusSchema,
} from '../validators/post.validators.js';

const router = Router();

// ─── Optional Auth Helper ─────────────────────────────────────────────────────

/**
 * Soft authentication — tries to verify the token if present,
 * but does NOT reject the request if there is no token.
 * Allows public visitors AND authenticated authors to hit the same endpoint.
 */
function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      req.user = { _id: decoded.sub, role: decoded.role, email: decoded.email };
    }
  } catch {
    // Silently ignore invalid/expired tokens for optional auth
    req.user = null;
  }
  next();
}

// ─── Public Routes (No Auth Required) ────────────────────────────────────────

/**
 * GET /api/posts
 * List all published posts.
 * Query params: page, limit, category, search
 */
router.get('/', getAllPublished);

/**
 * GET /api/posts/categories
 * Returns the hybrid category list (predefined + custom used categories).
 *
 * MUST be defined before /:slug — Express matches routes top-to-bottom,
 * so "categories" would otherwise be captured as a slug value.
 */
router.get('/categories', getCategories);

// ─── Protected Routes (Auth Required) ────────────────────────────────────────

/**
 * GET /api/posts/my
 * Returns all posts (draft + published) for the authenticated user.
 *
 * MUST be defined before /:slug for the same reason as /categories above.
 */
router.get('/my', verifyToken, getMyPosts);

/**
 * POST /api/posts
 * Create a new post. Any authenticated user can do this.
 * VISITOR → CREATOR role escalation happens inside the controller.
 */
router.post('/', verifyToken, validate(createPostSchema), createPost);

/**
 * PUT /api/posts/:id
 * Update an existing post. Must be the post owner.
 */
router.put('/:id', verifyToken, validate(updatePostSchema), updatePost);

/**
 * DELETE /api/posts/:id
 * Delete a post. Must be the post owner.
 */
router.delete('/:id', verifyToken, deletePost);

/**
 * PATCH /api/posts/:id/status
 * Toggle a post's status between DRAFT and PUBLISHED.
 * The "live switch" from the dashboard table row.
 */
router.patch('/:id/status', verifyToken, validate(toggleStatusSchema), toggleStatus);

/**
 * GET /api/posts/:slug
 * Fetch a single post by its SEO slug.
 * MUST be last — it is the catch-all dynamic segment.
 * Optional auth allows authors to preview their own drafts.
 */
router.get('/:slug', optionalAuth, getBySlug);

export default router;
