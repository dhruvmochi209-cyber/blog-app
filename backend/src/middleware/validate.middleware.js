import { ZodError } from 'zod';

/**
 * validate — Zod Validation Middleware (Factory)
 *
 * Takes a Zod schema that validates { body, params, query }
 * and returns a middleware that rejects the request with a
 * structured 400 response if validation fails.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), authController.register)
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate the relevant parts of the request
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      // Replace req fields with the sanitized/coerced values from Zod
      req.body = result.body ?? req.body;
      req.params = result.params ?? req.params;
      req.query = result.query ?? req.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Flatten Zod issues into a clean array of { field, message }
        // Zod v3 uses `error.issues` (error.errors is a deprecated alias that may be undefined)
        const errors = (error.issues ?? error.errors ?? []).map((issue) => ({
          field: (issue.path ?? []).filter((p) => p !== 'body').join('.') || 'unknown',
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      // Unexpected error — pass to global error handler
      next(error);
    }
  };
};
