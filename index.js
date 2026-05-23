require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/prisma');
require('./src/config/redis'); // Initialize Redis

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Check DB connection
    await prisma.$connect();
    console.log('Connected to PostgreSQL Database (Neon)');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
