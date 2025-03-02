#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Creating a package.json for the build..."
# Create a simplified package.json for the build directory
cat > .aws-sam/build/MedicationManagementFunction/package.json << EOF
{
  "name": "medication_management_api",
  "version": "1.0.0",
  "description": "Medication Management API",
  "main": "app.js",
  "dependencies": {
    "@prisma/client": "^5.10.0"
  }
}
EOF

echo "Copying source files..."
# Copy TypeScript files
cp -r src .aws-sam/build/MedicationManagementFunction/
cp app.ts .aws-sam/build/MedicationManagementFunction/
cp tsconfig.json .aws-sam/build/MedicationManagementFunction/

echo "Compiling TypeScript in the build directory..."
# Compile TypeScript in the build directory
cd .aws-sam/build/MedicationManagementFunction
npx tsc

echo "Installing Prisma in the build directory..."
# Install Prisma in the build directory
npm install --no-save

echo "Generating Prisma client in the build directory..."
# Copy Prisma schema
mkdir -p prisma
cp ../../../prisma/schema.prisma prisma/

# Generate Prisma client in the build directory
npx prisma generate

echo "Cleaning up..."
# Remove unnecessary files
rm -rf prisma
rm -rf src
rm app.ts
rm tsconfig.json

echo "Build completed successfully!"
