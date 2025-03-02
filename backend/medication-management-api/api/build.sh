#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npm run prisma:generate

echo "Compiling TypeScript..."
npx tsc

echo "Copying Prisma engines..."
mkdir -p .aws-sam/build/MedicationManagementFunction/node_modules/.prisma/client/
cp -r node_modules/.prisma/client/* .aws-sam/build/MedicationManagementFunction/node_modules/.prisma/client/

echo "Build completed successfully!"
