// Melindungi RESTful API dari akses domain luar yang tidak sah di lingkungan browser
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Akses ditolak oleh kebijakan CORS API Anda!'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = corsOptions;
