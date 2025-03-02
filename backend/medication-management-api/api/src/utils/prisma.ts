import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug database connection
console.log('DATABASE_URL:', process.env.DATABASE_URL);

let prismaInstance: PrismaClient | null = null;

// Function to get the Prisma client
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    // Create a new PrismaClient instance with explicit URL
    const databaseUrl = process.env.DATABASE_URL || 
      "postgresql://postgres:postgres@localhost:5432/medication_management?schema=public";
    
    console.log('Using database URL:', databaseUrl);
    
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
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