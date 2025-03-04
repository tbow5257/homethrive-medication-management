const { execSync } = require('child_process');

console.log('Generating API spec...');
execSync('cd backend/medication-management-api/api && npm run spec', { stdio: 'inherit' });

console.log('Building shared types...');
execSync('cd shared/types && npm run build', { stdio: 'inherit' });