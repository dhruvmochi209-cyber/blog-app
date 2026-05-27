import slugify from 'slugify';
import Post from '../models/Post.model.js';

/**
 * Slug generation utilities.
 *
 * Strategy:
 *  1. Convert the title to a URL-safe lowercase slug using `slugify`.
 *  2. Check if that slug already exists in the database.
 *  3. If it does, append an incrementing counter suffix until unique.
 *     e.g. "nextjs-tips" → "nextjs-tips-1" → "nextjs-tips-2"
 *
 * This ensures slugs are:
 *  - Human-readable (SEO-friendly)
 *  - Collision-safe across creators writing similar titles
 *  - Deterministic for the same title (no random suffixes)
 */

const SLUGIFY_OPTIONS = {
  lower: true,        // Force lowercase
  strict: true,       // Remove special characters (only a-z, 0-9, -)
  trim: true,         // Remove leading/trailing separators
  locale: 'en',       // English locale for transliteration
};

/**
 * Generate a URL-safe slug from a title string.
 * Does NOT check uniqueness — use generateUniqueSlug() for DB-safe slugs.
 *
 * @param {string} title
 * @returns {string} Raw slug
 */
export const generateSlug = (title) => {
  return slugify(title, SLUGIFY_OPTIONS);
};

/**
 * Generate a slug that is guaranteed unique in the database.
 * Optionally exclude a specific post ID (for update operations where
 * the slug might match the post being updated itself).
 *
 * @param {string} title - The article title
 * @param {string|null} excludePostId - Post _id to exclude from uniqueness check (for edits)
 * @returns {Promise<string>} A unique slug
 */
export const generateUniqueSlug = async (title, excludePostId = null) => {
  const baseSlug = generateSlug(title);

  // Build the query to check for existing slugs
  const buildQuery = (slug) => {
    const query = { slug };
    if (excludePostId) {
      query._id = { $ne: excludePostId }; // Exclude the current post on updates
    }
    return query;
  };

  // Check if the base slug is available
  const existing = await Post.findOne(buildQuery(baseSlug)).lean();
  if (!existing) {
    return baseSlug; // No collision — return as-is
  }

  // Collision detected — find the next available suffixed slug
  let counter = 1;
  while (true) {
    const candidateSlug = `${baseSlug}-${counter}`;
    const collision = await Post.findOne(buildQuery(candidateSlug)).lean();
    if (!collision) {
      return candidateSlug;
    }
    counter++;
  }
};
