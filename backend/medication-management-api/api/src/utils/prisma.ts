import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a singleton Prisma client
let prismaInstance: PrismaClient | null = null;

// Function to get the Prisma client
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    // Create a new PrismaClient instance
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

// Function to disconnect from the database
export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
} 