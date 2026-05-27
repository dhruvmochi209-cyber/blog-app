import { z } from 'zod';

/**
 * Zod validation schemas for blog post routes.
 */

// ─── Create Post ──────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .trim()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title cannot exceed 200 characters'),

    htmlContent: z
      .string({ required_error: 'Content is required' })
      .min(10, 'Content is too short'),

    category: z
      .string({ required_error: 'Category is required' })
      .trim()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category cannot exceed 50 characters'),

    excerpt: z
      .string({ required_error: 'Excerpt is required' })
      .trim()
      .min(10, 'Excerpt must be at least 10 characters')
      .max(500, 'Excerpt cannot exceed 500 characters'),

    coverImage: z
      .string()
      .trim()
      .url('Cover image must be a valid URL')
      .optional()
      .or(z.literal('')),

    seoKeywords: z
      .string()
      .trim()
      .max(500, 'SEO keywords string is too long')
      .optional()
      .default(''),

    status: z
      .enum(['DRAFT', 'PUBLISHED'], {
        errorMap: () => ({ message: 'Status must be DRAFT or PUBLISHED' }),
      })
      .optional()
      .default('DRAFT'),
  }),
});

// ─── Update Post ──────────────────────────────────────────────────────────────

export const updatePostSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(5, 'Title must be at least 5 characters')
      .max(200, 'Title cannot exceed 200 characters')
      .optional(),

    htmlContent: z
      .string()
      .min(10, 'Content is too short')
      .optional(),

    category: z
      .string()
      .trim()
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category cannot exceed 50 characters')
      .optional(),

    excerpt: z
      .string()
      .trim()
      .min(10, 'Excerpt must be at least 10 characters')
      .max(500, 'Excerpt cannot exceed 500 characters')
      .optional(),

    coverImage: z
      .string()
      .trim()
      .url('Cover image must be a valid URL')
      .optional()
      .or(z.literal('')),

    seoKeywords: z
      .string()
      .trim()
      .max(500, 'SEO keywords string is too long')
      .optional(),

    status: z
      .enum(['DRAFT', 'PUBLISHED'], {
        errorMap: () => ({ message: 'Status must be DRAFT or PUBLISHED' }),
      })
      .optional(),
  }),
});

// ─── Toggle Status ────────────────────────────────────────────────────────────

export const toggleStatusSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'PUBLISHED'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be DRAFT or PUBLISHED',
    }),
  }),
});
