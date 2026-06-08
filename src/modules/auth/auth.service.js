const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');

/**
 * Service Layer: Logika Autentikasi Pengguna
 * Mengurus verifikasi akun, enkripsi password, pendaftaran akun baru secara atomik,
 * serta pembuatan access token JWT dengan masa kedaluwarsa dinamis.
 */
class AuthService {
  /**
   * Pendaftaran Pengguna Baru (Register)
   * - Mengecek apakah email sudah terdaftar.
   * - Menghash password user dengan bcrypt salt rounds 10.
   * - Menyimpan user baru & mencatat aktivitas awal REGISTER di dalam transaksi database aman.
   * - Mengembalikan data user bersih (tanpa password_hash) beserta token JWT.
   */
  async register({ name, email, password, avatar_url }) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password_hash,
          avatar_url
        }
      });

      await tx.activity.create({
        data: {
          user_id: newUser.id,
          action_type: 'REGISTER',
          description: 'Mendaftar akun baru'
        }
      });

      return newUser;
    });

    const token = this.generateToken(result.id);
    const { password_hash: _, ...userWithoutPassword } = result;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Masuk Aplikasi (Login)
   * - Mencari user berdasarkan email.
   * - Membandingkan password input dengan password_hash di database menggunakan bcrypt.compare.
   * - Membuat token JWT dengan masa berlaku sesuai remember_me (true = 7d, false = 15m).
   * - Mencatat log login secara asinkron (background task) tanpa memblokir respon login klien.
   */
  async login({ email, password, remember_me }) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = this.generateToken(user.id, remember_me);

    prisma.activity.create({
      data: {
        user_id: user.id,
        action_type: 'LOGIN',
        description: 'Berhasil masuk ke dalam aplikasi'
      }
    }).catch(err => console.error('Failed to log login activity:', err));

    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Keluar Aplikasi (Logout)
   * Mengembalikan true secara default. Penghancuran token sepenuhnya ditangani
   * di sisi frontend (aplikasi Flutter) dengan membuang token dari penyimpanan lokal (SharedPreferences/SecureStorage).
   */
  async logout(token, expiryUnix) {
    return true;
  }

  /**
   * Pembuatan Token JWT (Akses Token)
   * - Jika remember_me bernilai true: Token kedaluwarsa dalam 7 hari.
   * - Jika remember_me bernilai false: Token kedaluwarsa dalam 15 menit.
   */
  generateToken(userId, remember_me = false) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: remember_me ? '7d' : '15m'
    });
  }
}

module.exports = new AuthService();

