import { execSync } from 'child_process';
import { join } from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🚀 Starting build process...');
  
  try {
    // Get the root directory (medication-management-api)
    const rootDir = join(__dirname, '..', '..', '..');
    const apiDir = join(rootDir, 'api');
    
    // Step 1: Generate Prisma client
    console.log('📦 Generating Prisma client...');
    execSync('npm run prisma:generate', { 
      cwd: apiDir,
      stdio: 'inherit'
    });
    
    // Step 2: Compile TypeScript
    console.log('🔄 Compiling TypeScript...');
    execSync('tsc', { 
      cwd: apiDir,
      stdio: 'inherit'
    });
    
    // Step 3: Copy Prisma engines
    console.log('📋 Copying Prisma engines...');
    if (fs.existsSync(join(apiDir, 'copy-prisma-engines.js'))) {
      execSync('node copy-prisma-engines.js', { 
        cwd: apiDir,
        stdio: 'inherit'
      });
    } else {
      console.warn('⚠️ copy-prisma-engines.js not found, skipping this step');
    }
    
    // Step 4: Sync Prisma schemas
    console.log('🔄 Syncing Prisma schemas...');
    if (fs.existsSync(join(apiDir, 'sync-prisma-schemas.js'))) {
      execSync('node sync-prisma-schemas.js', { 
        cwd: apiDir,
        stdio: 'inherit'
      });
    } else {
      console.warn('⚠️ sync-prisma-schemas.js not found, skipping this step');
    }
    
    // Step 5: Build Prisma layer
    console.log('🔨 Building Prisma layer...');
    const layerDir = join(rootDir, 'layers', 'prisma');
    if (fs.existsSync(layerDir)) {
      execSync('npm run build', { 
        cwd: layerDir,
        stdio: 'inherit'
      });
    } else {
      console.warn('⚠️ Prisma layer directory not found, skipping this step');
    }
    
    // Step 6: Run SAM build
    console.log('🏗️ Running SAM build...');
    execSync('sam build', { 
      cwd: rootDir,
      stdio: 'inherit'
    });
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

main(); 