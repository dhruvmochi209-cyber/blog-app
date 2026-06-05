import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { getBookmarks, toggleBookmark, getUserProfile, updateProfile } from '../controllers/user.controller.js';

const router = Router();

// ─── Profile (Authenticated) ──────────────────────────────────────────────────
router.put('/profile', verifyToken, updateProfile);

// ─── Bookmarks (Authenticated) ────────────────────────────────────────────────
router.get('/bookmarks', verifyToken, getBookmarks);
router.post('/bookmarks/:postId', verifyToken, toggleBookmark);

// ─── Public Routes ────────────────────────────────────────────────────────────
// Must be at the bottom so it doesn't catch /profile or /bookmarks
router.get('/:id', getUserProfile);

export default router;
