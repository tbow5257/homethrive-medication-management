import { execSync } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🚀 Initializing database environment...');
  
  try {
    // Get the root directory (medication-management-api)
    const rootDir = join(__dirname, '..', '..', '..');
    const apiDir = join(rootDir, 'api');
    
    // Check if docker-compose.yml exists
    if (!fs.existsSync(join(rootDir, 'docker-compose.yml'))) {
      throw new Error('docker-compose.yml not found in root directory');
    }
    
    // Start the database container
    console.log('📦 Starting database container...');
    execSync('docker compose up -d', { 
      cwd: rootDir,
      stdio: 'inherit'
    });
    
    // Wait for database to be ready
    console.log('⏳ Waiting for database to be ready...');
    let retries = 10;
    while (retries > 0) {
      try {
        execSync('docker compose exec -T postgres pg_isready -U postgres', { 
          cwd: rootDir,
          stdio: 'pipe'
        });
        console.log('✅ Database is ready');
        break;
      } catch (error) {
        console.log(`Database not ready yet, retrying... (${retries} attempts left)`);
        retries--;
        if (retries === 0) {
          throw new Error('Database failed to start');
        }
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    execSync('npm run prisma:migrate:dev', { 
      cwd: apiDir,
      stdio: 'inherit'
    });
    
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

main(); 