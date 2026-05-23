const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/prisma');
const redisClient = require('../../config/redis');

/**
 * Authentication Service layer
 */
class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password, avatar_url }) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user and log initial activity inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password_hash,
          avatar_url
        }
      });

      // Create initial activity log
      await tx.activity.create({
        data: {
          user_id: newUser.id,
          action_type: 'REGISTER',
          description: 'Mendaftar akun baru'
        }
      });

      return newUser;
    });

    // Generate JWT token
    const token = this.generateToken(result.id);

    // Remove password_hash from the returned user object
    const { password_hash: _, ...userWithoutPassword } = result;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = this.generateToken(user.id);

    // Log login activity asynchronously
    prisma.activity.create({
      data: {
        user_id: user.id,
        action_type: 'LOGIN',
        description: 'Berhasil masuk ke dalam aplikasi'
      }
    }).catch(err => console.error('Failed to log login activity:', err));

    // Remove password_hash from response
    const { password_hash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Logout user by blacklisting their token in Redis
   */
  async logout(token, expiryUnix) {
    if (!redisClient || !redisClient.isOpen) {
      console.warn('Redis is not connected, token could not be blacklisted on logout');
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const remainingTime = expiryUnix - now;

    if (remainingTime > 0) {
      // Set the token blacklist with expiry in seconds
      await redisClient.setEx(`blacklist:${token}`, remainingTime, 'true');
    }

    return true;
  }

  /**
   * Generate JWT Token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '7d' // Valid for 7 days
    });
  }
}

module.exports = new AuthService();
