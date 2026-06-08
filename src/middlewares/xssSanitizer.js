/**
 * Sanitizer Keamanan XSS (Cross-Site Scripting)
 * Mengubah karakter HTML khusus menjadi entitas aman agar database terbebas dari injeksi tag script.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Traversal Objek Rekursif
 * Menjelajahi semua tingkatan properti di dalam nested objek/array untuk membersihkan data string.
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
};

/**
 * Middleware Sanitasi Global
 * Otomatis membersihkan body, query string, dan URL params dari input berbahaya.
 */
const xssSanitizer = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = xssSanitizer;

