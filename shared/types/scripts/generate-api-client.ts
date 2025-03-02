import { generate } from 'openapi-typescript-codegen';
import path from 'path';

async function generateClient() {
  await generate({
    input: path.resolve(__dirname, '../src/swagger.json'),
    output: path.resolve(__dirname, '../src/api-client'),
    exportCore: true,
    exportServices: true,
    exportModels: true,
  });
}

generateClient();