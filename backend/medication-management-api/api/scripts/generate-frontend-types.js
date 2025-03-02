/**
 * Script to generate frontend types from Prisma schema
 */
const fs = require('fs-extra');
const path = require('path');

// Source: Prisma generated types
const prismaTypesDir = path.resolve(__dirname, '../../node_modules/.prisma/client');
// Target: Frontend types directory
const frontendTypesDir = path.resolve(__dirname, '../../../../frontend/src/types/api');

// Ensure target directory exists
fs.ensureDirSync(frontendTypesDir);

// Copy the Prisma client index.d.ts file which contains all the types
fs.copySync(
  path.join(prismaTypesDir, 'index.d.ts'),
  path.join(frontendTypesDir, 'prisma-types.d.ts')
);

// Create an API response type
const apiResponseContent = `/**
 * API Response Types
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
`;

fs.writeFileSync(path.join(frontendTypesDir, 'api-response.ts'), apiResponseContent);

// Create an index.ts file that re-exports the types
const indexContent = `// Auto-generated from Prisma schema
export * from './prisma-types';
export * from './api-response';
`;

fs.writeFileSync(path.join(frontendTypesDir, 'index.ts'), indexContent);

console.log('Frontend types generated successfully!'); 