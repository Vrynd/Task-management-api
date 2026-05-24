// Mmeng-escape karakter HTML berbahaya guna mencegah serangan XSS (Cross-Site Scripting)
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

// Melakukan traversal rekursif untuk mensanitasi setiap string di dalam objek atau array
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

// Menyaring input XSS pada req.body, req.query, dan req.params secara otomatis
const xssSanitizer = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
};

module.exports = xssSanitizer;
