/**
 * Middleware to validate request body using Zod schema
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  // Store the validated data back to req.body (or req.validatedBody)
  req.body = result.data;
  next();
};

module.exports = validate;
