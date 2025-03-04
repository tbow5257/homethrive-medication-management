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
import {
  getCareRecipientsHandler,
  getCareRecipientHandler,
  createCareRecipientHandler,
  updateCareRecipientHandler,
  deleteCareRecipientHandler
} from './src/handlers/careRecipient';
import {
  getSchedulesHandler,
  getScheduleHandler,
  createScheduleHandler,
  updateScheduleHandler,
  deleteScheduleHandler
} from './src/handlers/schedule';
import {
  getDosesHandler,
  getDoseHandler,
  updateDoseStatusHandler,
  createDoseHandler
} from './src/handlers/dose';
import {
  getDashboardStatsHandler,
  getDashboardUpcomingDosesHandler
} from './src/handlers/dashboard';
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
  
  // Care Recipient endpoints - protected with authentication
  if (path.match(/^\/care-recipients\/?$/) && httpMethod === 'GET') {
    return requireAuth(getCareRecipientsHandler)(event);
  }
  
  if (path.match(/^\/care-recipients\/?$/) && httpMethod === 'POST') {
    return requireAuth(createCareRecipientHandler)(event);
  }
  
  if (path.match(/^\/care-recipients\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'GET') {
    return requireAuth(getCareRecipientHandler)(event);
  }
  
  if (path.match(/^\/care-recipients\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'PUT') {
    return requireAuth(updateCareRecipientHandler)(event);
  }
  
  if (path.match(/^\/care-recipients\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'DELETE') {
    return requireAuth(deleteCareRecipientHandler)(event);
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
  
  // Schedule endpoints - protected with authentication
  if (path.match(/^\/schedules\/?$/) && httpMethod === 'GET') {
    return requireAuth(getSchedulesHandler)(event);
  }
  
  if (path.match(/^\/schedules\/?$/) && httpMethod === 'POST') {
    return requireAuth(createScheduleHandler)(event);
  }
  
  if (path.match(/^\/schedules\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'GET') {
    return requireAuth(getScheduleHandler)(event);
  }
  
  if (path.match(/^\/schedules\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'PUT') {
    return requireAuth(updateScheduleHandler)(event);
  }
  
  if (path.match(/^\/schedules\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'DELETE') {
    return requireAuth(deleteScheduleHandler)(event);
  }
  
  // Dose endpoints - protected with authentication
  if (path.match(/^\/doses\/?$/) && httpMethod === 'GET') {
    return requireAuth(getDosesHandler)(event);
  }
  
  if (path.match(/^\/doses\/[a-zA-Z0-9-]+\/?$/) && httpMethod === 'GET') {
    return requireAuth(getDoseHandler)(event);
  }
  
  if (path.match(/^\/doses\/[a-zA-Z0-9-]+\/status\/?$/) && httpMethod === 'PUT') {
    return requireAuth(updateDoseStatusHandler)(event);
  }
  
  if (path.match(/^\/doses\/?$/) && httpMethod === 'POST') {
    return requireAuth(createDoseHandler)(event);
  }
  
  // Dashboard endpoints - protected with authentication
  if (path.match(/^\/dashboard\/stats\/?$/) && httpMethod === 'GET') {
    return requireAuth(getDashboardStatsHandler)(event);
  }
  
  if (path.match(/^\/dashboard\/upcoming-doses\/?$/) && httpMethod === 'GET') {
    return requireAuth(getDashboardUpcomingDosesHandler)(event);
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