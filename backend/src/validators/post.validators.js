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
      .string()
      .optional()
      .or(z.literal('')),

    category: z
      .string()
      .trim()
      .optional()
      .or(z.literal('')),

    excerpt: z
      .string()
      .trim()
      .optional()
      .or(z.literal('')),

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
  }).superRefine((data, ctx) => {
    if (data.status === 'PUBLISHED') {
      if (!data.htmlContent || data.htmlContent.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['htmlContent'],
          message: 'Content is required and must be at least 10 characters',
        });
      }
      if (!data.category || data.category.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['category'],
          message: 'Category is required and must be at least 2 characters',
        });
      }
      if (!data.excerpt || data.excerpt.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['excerpt'],
          message: 'Excerpt is required and must be at least 10 characters',
        });
      }
    }
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
      .optional()
      .or(z.literal('')),

    category: z
      .string()
      .trim()
      .optional()
      .or(z.literal('')),

    excerpt: z
      .string()
      .trim()
      .optional()
      .or(z.literal('')),

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
  }).superRefine((data, ctx) => {
    if (data.status === 'PUBLISHED') {
      if (data.htmlContent !== undefined && data.htmlContent.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['htmlContent'],
          message: 'Content must be at least 10 characters',
        });
      }
      if (data.category !== undefined && data.category.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['category'],
          message: 'Category must be at least 2 characters',
        });
      }
      if (data.excerpt !== undefined && data.excerpt.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['excerpt'],
          message: 'Excerpt must be at least 10 characters',
        });
      }
    }
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
