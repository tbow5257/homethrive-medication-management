import * as fs from 'fs';
import * as path from 'path';

// Paths
const prismaSchemaPath = path.resolve(__dirname, '../../../backend/medication-management-api/api/prisma/schema.prisma');
const outputPath = path.resolve(__dirname, '../src/index.ts');

interface ModelDefinition {
  name: string;
  body: string;
}

// Generate the type file
async function generateTypes() {
  console.log('Generating types from Prisma schema...');
  
  // Check if Prisma schema exists
  if (!fs.existsSync(prismaSchemaPath)) {
    console.error(`Prisma schema not found at ${prismaSchemaPath}`);
    process.exit(1);
  }
  
  // Get the Prisma schema
  const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf-8');
  
  // Extract model definitions
  const modelRegex = /model\s+(\w+)\s+{([^}]*)}/g;
  let match;
  const models: ModelDefinition[] = [];
  
  while ((match = modelRegex.exec(prismaSchema)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];
    models.push({ name: modelName, body: modelBody });
  }
  
  // Generate TypeScript interfaces
  let output = `// Auto-generated from Prisma schema
// Do not edit directly

/**
 * Shared types for Medication Management application
 * Generated from Prisma schema
 */

`;

  // Generate interfaces for each model
  models.forEach(model => {
    output += `export interface ${model.name} {\n`;
    
    // Parse fields
    const fields = model.body.trim().split('\n');
    
    fields.forEach(field => {
      // Skip comments and empty lines
      if (field.trim().startsWith('//') || field.trim() === '') return;
      
      // Skip relation fields (they start with @)
      if (field.trim().startsWith('@')) return;
      
      // Extract field name and type
      const fieldMatch = field.trim().match(/(\w+)\s+(\w+)(\[\])?(\?)?/);
      if (fieldMatch) {
        const [, fieldName, fieldType, isArray, isOptional] = fieldMatch;
        
        // Convert Prisma types to TypeScript types
        let tsType;
        switch (fieldType) {
          case 'String':
            tsType = 'string';
            break;
          case 'Int':
          case 'Float':
            tsType = 'number';
            break;
          case 'Boolean':
            tsType = 'boolean';
            break;
          case 'DateTime':
            tsType = 'string'; // ISO date string
            break;
          default:
            tsType = fieldType; // Use as is for custom types
        }
        
        // Add array notation if needed
        if (isArray) {
          tsType = `${tsType}[]`;
        }
        
        // Check if field is optional from schema or has @default
        const isFieldOptional = isOptional || field.includes('@default');
        
        output += `  ${fieldName}${isFieldOptional ? '?' : ''}: ${tsType};\n`;
      }
    });
    
    output += '}\n\n';
  });
  
  // Add API response types
  output += `export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type DoseStatus = 'scheduled' | 'taken' | 'missed';

export interface DoseFilters {
  recipientId?: string;
  status?: DoseStatus;
  startDate?: string;
  endDate?: string;
}

export interface DashboardStats {
  totalRecipients: number;
  totalMedications: number;
  totalSchedules: number;
  upcomingDoses: number;
  takenDoses: number;
  missedDoses: number;
}
`;
  
  // Create directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write the file
  fs.writeFileSync(outputPath, output);
  console.log(`Generated types at ${outputPath}`);
}

generateTypes().catch(console.error); 