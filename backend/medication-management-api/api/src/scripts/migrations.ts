import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Starting database migration process');
  console.log('Environment variables:', {
    DATABASE_URL: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'), // Hide password
    NODE_ENV: process.env.NODE_ENV
  });
  
  try {
    console.log('Running prisma migrate deploy...');
    
    // Use try-catch with output capture instead of stdio: 'inherit'
    try {
      const migrateOutput = execSync('npx prisma migrate deploy', { 
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      console.log('Migration output:', migrateOutput);
    } catch (migrateError: any) {
      console.error('Migration command failed:', migrateError.message);
      console.error('Migration stderr:', migrateError.stderr?.toString());
      console.error('Migration stdout:', migrateError.stdout?.toString());
      throw migrateError;
    }
    
    // Run seed if in dev
    if (process.env.NODE_ENV === 'dev') {
      console.log('Running seed data...');
      try {
        const seedOutput = execSync('npx prisma db seed', { 
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'] 
        });
        console.log('Seed output:', seedOutput);
      } catch (seedError: any) {
        console.error('Seed command failed:', seedError.message);
        console.error('Seed stderr:', seedError.stderr?.toString());
        console.error('Seed stdout:', seedError.stdout?.toString());
        throw seedError;
      }
    }

    console.log('Migration completed successfully');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Migrations completed successfully' })
    };
  } catch (error: any) {
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Migration failed',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
