import express from 'express';
import { uploadImage } from '../controllers/upload.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { checkRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Only authenticated users (Creators or Visitors wanting to be creators) can upload images
router.post('/image', verifyToken, upload.single('image'), uploadImage);

export default router;
