const { PrismaClient } = require('@prisma/client');

// Create a singleton Prisma client
let prismaInstance = null;

function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

// Export the client
module.exports = getPrismaClient(); 