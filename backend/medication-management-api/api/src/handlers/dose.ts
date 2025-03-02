import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  badRequestResponse, 
  notFoundResponse, 
  serverErrorResponse,
  unauthorizedResponse
} from '../utils/response';
import { disconnectPrisma } from '../utils/prisma';
// Import Prisma types directly
import { Dose } from '@prisma/client';
import { ApiResponse } from '../types/api';
import { DoseController } from '../controllers/DoseController';
import { authenticate } from '../utils/auth';

/**
 * Get all doses with optional filtering
 */
export const getDosesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get query parameters
    const { 
      recipientId, 
      status, 
      startDate, 
      endDate 
    } = event.queryStringParameters || {};
    
    // Use the controller
    const controller = new DoseController();
    const result = await controller.getDoses(recipientId, status, startDate, endDate);
    
    return successResponse(result);
  } catch (error) {
    console.error('Error getting doses:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get a dose by ID
 */
export const getDoseHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get dose ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Dose ID is required');
    }
    
    // Use the controller
    const controller = new DoseController();
    
    try {
      const result = await controller.getDose(id);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Dose not found") {
        return notFoundResponse('Dose not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting dose:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Update a dose status
 */
export const updateDoseStatusHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get dose ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Dose ID is required');
    }
    
    // Parse request body
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }
    
    const body = JSON.parse(event.body);
    
    // Use the controller
    const controller = new DoseController();
    
    try {
      const result = await controller.updateDoseStatus(id, body);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Dose not found") {
        return notFoundResponse('Dose not found');
      }
      if (error.message.includes("Valid status is required")) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating dose status:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get upcoming doses
 */
export const getUpcomingDosesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get query parameters
    const { limit = '5' } = event.queryStringParameters || {};
    
    // Parse limit
    const limitNum = parseInt(limit, 10);
    
    // Use the controller
    const controller = new DoseController();
    const result = await controller.getUpcomingDoses(limitNum);
    
    return successResponse(result);
  } catch (error) {
    console.error('Error getting upcoming doses:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStatsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Use the controller
    const controller = new DoseController();
    const result = await controller.getDashboardStats();
    
    return successResponse(result);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 