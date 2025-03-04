import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Run migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Run seed if in dev
    if (process.env.NODE_ENV === 'dev') {
      execSync('npx prisma db seed', { stdio: 'inherit' });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Migrations completed successfully' })
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Migration failed' })
    };
  }
};
