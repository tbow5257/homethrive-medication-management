import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  getMedicationsHandler, 
  getMedicationHandler, 
  createMedicationHandler, 
  updateMedicationHandler, 
  deleteMedicationHandler 
} from './src/handlers/medication';
import { successResponse, serverErrorResponse } from './src/utils/response';

/**
 * Router function to route requests to the appropriate handler
 */
const router = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path } = event;
  
  // Health check endpoint
  if (path === '/health' && httpMethod === 'GET') {
    return successResponse({ status: 'ok' });
  }
  
  // Medication endpoints
  if (path.match(/^\/medications\/?$/) && httpMethod === 'GET') {
    return getMedicationsHandler(event);
  }
  
  if (path.match(/^\/medications\/?$/) && httpMethod === 'POST') {
    return createMedicationHandler(event);
  }
  
  if (path.match(/^\/medications\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'GET') {
    return getMedicationHandler(event);
  }
  
  if (path.match(/^\/medications\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'PUT') {
    return updateMedicationHandler(event);
  }
  
  if (path.match(/^\/medications\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'DELETE') {
    return deleteMedicationHandler(event);
  }
  
  // If no route matches, return 404
  return {
    statusCode: 404,
    body: JSON.stringify({
      message: 'Not found',
    }),
  };
};

/**
 * Lambda handler
 */
export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Route the request
    const response = await router(event);
    
    return response;
  } catch (err) {
    console.error('Error:', err);
    return serverErrorResponse();
  }
}; 