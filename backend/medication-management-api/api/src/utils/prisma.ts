import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a singleton Prisma client
let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

// Function to disconnect from the database
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
} 