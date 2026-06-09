import mongoose from 'mongoose';

/**
 * Predefined category list for the hybrid category system.
 * Creators can choose from these OR enter a custom category.
 * The backend stores the category as a plain string — no strict enum enforcement —
 * so the frontend can present the list as suggestions.
 */
export const PREDEFINED_CATEGORIES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'C++',
  'React',
  'Next.js',
  'Vue',
  'Angular',
  'Node.js',
  'System Design',
  'DevOps',
  'Cloud & AWS',
  'Docker & Kubernetes',
  'Databases',
  'PostgreSQL',
  'MongoDB',
  'Security',
  'Algorithms & DSA',
  'AI & Machine Learning',
  'Data Science',
  'Web3 & Crypto',
  'Mobile Development',
  'Engineering',
  'Design',
  'Product',
  'Career & Growth',
  'Startups',
  'Open Source',
  'Culture',
  'Other',
];

/**
 * Blog Post Schema
 *
 * Key design decisions:
 * - slug: auto-generated from title, unique, indexed for fast lookup
 * - htmlContent: raw HTML string from TipTap/Quill/Editor.js rich text editor
 * - status: DRAFT (private, only creator sees it) | PUBLISHED (public)
 * - authorId: FK to User — used for ownership verification on write ops
 * - category: stored as a plain string (hybrid: predefined OR custom)
 * - seoKeywords: comma-separated string (matches blueprint spec)
 */
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    htmlContent: {
      type: String,
      required: function() { return this.status === 'PUBLISHED'; },
    },

    category: {
      type: String,
      required: function() { return this.status === 'PUBLISHED'; },
      trim: true,
    },

    coverImage: {
      type: String,
      default: null, // URL string pointing to cover image
      trim: true,
    },

    excerpt: {
      type: String,
      required: function() { return this.status === 'PUBLISHED'; },
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },

    seoKeywords: {
      type: String,
      default: '', // Comma-separated string, e.g. "react, hooks, state"
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: ['DRAFT', 'PUBLISHED'],
        message: 'Status must be either DRAFT or PUBLISHED',
      },
      default: 'DRAFT',
    },

    views: {
      type: Number,
      default: 0,
      index: true,
    },

    viewedBy: [{
      type: String, // Stores IP address or User ID to prevent duplicate views
      select: false,
    }],

    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        delete ret.viewedBy; // Do not expose IPs or User IDs to the client
        return ret;
      },
    },
  }
);

// ─── Compound Index ───────────────────────────────────────────────────────────

// Speed up dashboard queries: "all PUBLISHED posts sorted by createdAt"
postSchema.index({ status: 1, createdAt: -1 });

// Speed up category filtering
postSchema.index({ category: 1, status: 1 });

// Speed up "my posts" dashboard listing per author
postSchema.index({ authorId: 1, createdAt: -1 });

// ─── Virtual: Author (populated) ──────────────────────────────────────────────

// Allows Post.find().populate('author') for convenience
postSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

const Post = mongoose.model('Post', postSchema);

export default Post;
