import User from '../models/User.model.js';
import Post from '../models/Post.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * GET /api/users/bookmarks
 * Authorization: Bearer token required
 *
 * Returns the authenticated user's bookmarked posts, fully populated
 * so they can be rendered on the bookmarks feed page.
 */
export const getBookmarks = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarks',
    match: { status: 'PUBLISHED' }, // Only show published bookmarks, skip deleted/drafts
    populate: { path: 'authorId', select: 'name avatar role' }
  }).lean();

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // user.bookmarks will now be an array of Post objects (ignoring any nulls from deleted posts)
  const bookmarkedPosts = user.bookmarks.filter(post => post != null);

  res.status(200).json({
    success: true,
    data: bookmarkedPosts,
  });
};

/**
 * POST /api/users/bookmarks/:postId
 * Authorization: Bearer token required
 *
 * Toggles a bookmark for a specific post. If it's already bookmarked,
 * it removes it. If it's not, it adds it.
 */
export const toggleBookmark = async (req, res) => {
  const { postId } = req.params;

  // Verify the post exists and is published
  const post = await Post.findOne({ _id: postId, status: 'PUBLISHED' });
  if (!post) {
    throw new AppError('Post not found or unavailable.', 404);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Ensure bookmarks array is initialized
  if (!user.bookmarks) {
    user.bookmarks = [];
  }

  const hasBookmarked = user.bookmarks.some(id => id.toString() === postId.toString());

  if (hasBookmarked) {
    // Remove it
    user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId.toString());
  } else {
    // Add it
    user.bookmarks.unshift(postId); // Add to beginning so newest bookmarks are first
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: hasBookmarked ? 'Bookmark removed.' : 'Post bookmarked.',
    bookmarked: !hasBookmarked,
    bookmarks: user.bookmarks,
  });
};

/**
 * GET /api/users/:id
 * Public route (no auth required)
 * Fetches public profile information for a user.
 */
export const getUserProfile = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select('name avatar bio role createdAt');
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Count published posts
  const postCount = await Post.countDocuments({ authorId: id, status: 'PUBLISHED' });

  res.status(200).json({
    success: true,
    user: {
      ...user.toObject(),
      postCount
    }
  });
};

/**
 * PUT /api/users/profile
 * Authorization: Bearer token required
 * Updates the authenticated user's profile information.
 */
export const updateProfile = async (req, res) => {
  const { name, bio, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio; // Allow empty string to clear bio
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    user
  });
};
