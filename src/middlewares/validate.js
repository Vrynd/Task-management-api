/**
 * Middleware Validator Schema Zod
 * - safeParse: Memvalidasi body request secara aman tanpa melempar crash.
 * - error: Jika gagal, melempar kesalahan ke global error handler (next).
 * - req.body: Menyimpan data yang terfilter bersih kembali ke body request.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(result.error);
  }
  req.body = result.data;
  next();
};

module.exports = validate;

