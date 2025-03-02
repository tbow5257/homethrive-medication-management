import 'reflect-metadata';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  getMedicationsHandler, 
  getMedicationHandler, 
  createMedicationHandler, 
  updateMedicationHandler, 
  deleteMedicationHandler 
} from './src/handlers/medication';
import {
  registerHandler,
  loginHandler,
  profileHandler
} from './src/handlers/auth';
import { successResponse, serverErrorResponse } from './src/utils/response';
import { requireAuth } from './src/utils/auth';

/**
 * Router function to route requests to the appropriate handler
 */
const router = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path } = event;
  
  // Health check endpoint
  if (path === '/health' && httpMethod === 'GET') {
    return successResponse({ status: 'ok' });
  }
  
  // Auth endpoints
  if (path.match(/^\/auth\/register\/?$/) && httpMethod === 'POST') {
    return registerHandler(event);
  }
  
  if (path.match(/^\/auth\/login\/?$/) && httpMethod === 'POST') {
    return loginHandler(event);
  }
  
  if (path.match(/^\/auth\/profile\/?$/) && httpMethod === 'GET') {
    return requireAuth(profileHandler)(event);
  }
  
  // Medication endpoints - protected with authentication
  if (path.match(/^\/medications\/?$/) && httpMethod === 'GET') {
    return requireAuth(getMedicationsHandler)(event);
  }
  
  if (path.match(/^\/medications\/?$/) && httpMethod === 'POST') {
    return requireAuth(createMedicationHandler)(event);
  }
  
  if (path.match(/^\/medications\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'GET') {
    return requireAuth(getMedicationHandler)(event);
  }
  
  if (path.match(/^\/medications\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'PUT') {
    return requireAuth(updateMedicationHandler)(event);
  }
  
  if (path.match(/^\/medications\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'DELETE') {
    return requireAuth(deleteMedicationHandler)(event);
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