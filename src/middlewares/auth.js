const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { errorResponse } = require('../utils/response');

/**
 * Middleware Otorisasi & Verifikasi Token JWT
 * Mencegat request yang masuk, memvalidasi tanda tangan token JWT,
 * mencocokkan ke database, dan menempelkan identitas user aktif ke req.user.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Memeriksa keberadaan header Authorization dengan format Bearer
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. Please provide a valid Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];

    // 2. Dekripsi dan verifikasi token menggunakan JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Mengambil profil user terbaru dari PostgreSQL
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true
      }
    });

    // 4. Jika user sudah terhapus di DB tetapi token masih aktif
    if (!user) {
      return errorResponse(res, 'User no longer exists.', 401);
    }

    // 5. Menyimpan data user & token ke objek request Express
    req.user = user;
    req.token = token;
    req.tokenExpiry = decoded.exp; // Epoch timestamp batas kedaluwarsa token

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    // 6. Penanganan khusus jika masa aktif token telah habis
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please login again.', 401);
    }
    return errorResponse(res, 'Invalid token. Access denied.', 401);
  }
};

module.exports = authMiddleware;

