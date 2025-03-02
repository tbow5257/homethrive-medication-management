const fs = require('fs');
const path = require('path');

// Paths to the schema files
const sourceSchemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const targetSchemaPath = path.join(__dirname, '..', 'layers', 'prisma', 'schema.prisma');

// Copy the schema file
console.log(`Copying schema from ${sourceSchemaPath} to ${targetSchemaPath}`);
fs.copyFileSync(sourceSchemaPath, targetSchemaPath);
console.log('Schema copied successfully');
