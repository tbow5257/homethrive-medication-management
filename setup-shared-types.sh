#!/bin/bash
set -e

echo "Setting up shared types package..."

# Navigate to shared types directory
cd shared/types

# Install dependencies
echo "Installing dependencies for shared types..."
npm install

# Generate types from Prisma schema
echo "Generating types from Prisma schema..."
npm run generate

# Build the package
echo "Building shared types package..."
npm run build

# Create a symlink for the package
echo "Creating symlink for shared types package..."
npm link

# Navigate to frontend directory
cd ../../frontend

# Link the shared types package
echo "Linking shared types package to frontend..."
npm link @medication-management/shared-types

# Navigate to backend directory
cd ../backend/medication-management-api/api

# Link the shared types package
echo "Linking shared types package to backend..."
npm link @medication-management/shared-types

echo "Setup complete! Shared types package is now linked to both frontend and backend."
echo "You can now import types from '@medication-management/shared-types' in your code." 