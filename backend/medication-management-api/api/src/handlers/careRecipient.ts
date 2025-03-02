import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  badRequestResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  noContentResponse,
  unauthorizedResponse
} from '../utils/response';
import { getPrismaClient, disconnectPrisma } from '../utils/prisma';
// Import Prisma types directly
import { CareRecipient } from '@prisma/client';
import { ApiResponse } from '../types/api';
import { CareRecipientController } from '../controllers/CareRecipientController';
import { authenticate } from '../utils/auth';

/**
 * Get all care recipients
 */
export const getCareRecipientsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }

    // Use the controller
    const controller = new CareRecipientController();
    const result = await controller.getCareRecipients();
    
    return successResponse(result);
  } catch (error) {
    console.error('Error getting care recipients:', error);
    return serverErrorResponse();
  }
};

/**
 * Get a care recipient by ID
 */
export const getCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }

    const id = event.pathParameters?.id;
    if (!id) {
      return badRequestResponse('Care recipient ID is required');
    }

    // Use the controller
    const controller = new CareRecipientController();
    
    try {
      const result = await controller.getCareRecipient(id);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Care recipient not found") {
        return notFoundResponse('Care recipient not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting care recipient:', error);
    return serverErrorResponse();
  }
};

/**
 * Create a new care recipient
 */
export const createCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Parse request body
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }
    
    const body = JSON.parse(event.body);
    
    // Use the controller
    const controller = new CareRecipientController();
    
    try {
      const result = await controller.createCareRecipient(body);
      return createdResponse(result);
    } catch (error: any) {
      if (error.message.includes("required")) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating care recipient:', error);
    return serverErrorResponse();
  }
};

/**
 * Update a care recipient
 */
export const updateCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get care recipient ID from path parameters
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('Care recipient ID is required');
    }
    
    // Parse request body
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }
    
    const body = JSON.parse(event.body);
    
    // Use the controller
    const controller = new CareRecipientController();
    
    try {
      const result = await controller.updateCareRecipient(id, body);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Care recipient not found") {
        return notFoundResponse('Care recipient not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating care recipient:', error);
    return serverErrorResponse();
  }
};

/**
 * Delete a care recipient
 */
export const deleteCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get care recipient ID from path parameters
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('Care recipient ID is required');
    }
    
    // Use the controller
    const controller = new CareRecipientController();
    
    try {
      await controller.deleteCareRecipient(id);
      return noContentResponse();
    } catch (error: any) {
      if (error.message === "Care recipient not found") {
        return notFoundResponse('Care recipient not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting care recipient:', error);
    return serverErrorResponse();
  }
}; 