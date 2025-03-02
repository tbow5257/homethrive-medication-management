const { copyFileSync, mkdirSync, existsSync, readdirSync } = require('fs-extra');
const { join } = require('path');

// Find the Prisma engine files
const findPrismaEngineFiles = () => {
  const prismaClientDir = join(__dirname, 'node_modules', '.prisma', 'client');
  if (!existsSync(prismaClientDir)) {
    console.error('Prisma client directory not found');
    return [];
  }
  
  return readdirSync(prismaClientDir)
    .filter(file => file.includes('libquery_engine') || file.includes('query_engine'));
};

// Copy Prisma engine files to the output directory
const copyPrismaEngines = () => {
  const engineFiles = findPrismaEngineFiles();
  const sourceDir = join(__dirname, 'node_modules', '.prisma', 'client');
  
  // Add dist directory as a target
  const targetDirs = [
    join(__dirname, 'node_modules', '.prisma', 'client'),
    join(__dirname, 'node_modules', '@prisma', 'client', 'runtime'),
    join(__dirname, 'dist', 'node_modules', '.prisma', 'client')
  ];
  
  // Create target directory if it doesn't exist
  targetDirs.forEach(targetDir => mkdirSync(targetDir, { recursive: true }));
  
  // Copy each engine file
  engineFiles.forEach(file => {
    const sourcePath = join(sourceDir, file);
    targetDirs.forEach(targetDir => {
      const targetPath = join(targetDir, file);
      try {
        copyFileSync(sourcePath, targetPath);
        console.log(`Copied ${file} to build directory`);
      } catch (error) {
        console.error(`Error copying ${file}: ${error.message}`);
      }
    });
  });
};

// Run the copy function
copyPrismaEngines();