const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // Hanya coba 2 kali, jika gagal langsung stop untuk mencegah spamming tak berujung
      if (retries > 2) {
        console.warn('Redis tidak aktif. Aplikasi akan berjalan menggunakan database PostgreSQL saja (caching & blacklist dinonaktifkan).');
        return false; // Berhenti mencoba rekoneksi
      }
      return 1000; // Jeda 1 detik sebelum mencoba lagi
    }
  }
});

// Tangani error secara anggun tanpa melakukan spamming ketika Redis tidak aktif
redisClient.on('error', (err) => {
  if (redisClient.isOpen) {
    console.error('Redis Client Error:', err.message);
  }
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis Cache');
  } catch (error) {
    // Ditangkap saat reconnectStrategy mengembalikan false
  }
})();

module.exports = redisClient;
