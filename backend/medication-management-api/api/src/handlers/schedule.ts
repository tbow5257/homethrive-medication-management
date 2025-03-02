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
import { disconnectPrisma } from '../utils/prisma';
// Import Prisma types directly
import { Schedule } from '@prisma/client';
import { ApiResponse } from '../types/api';
import { ScheduleController } from '../controllers/ScheduleController';
import { authenticate } from '../utils/auth';

/**
 * Get all schedules
 */
export const getSchedulesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get query parameters
    const { medicationId } = event.queryStringParameters || {};
    
    // Use the controller
    const controller = new ScheduleController();
    const result = await controller.getSchedules(medicationId);
    
    return successResponse(result);
  } catch (error) {
    console.error('Error getting schedules:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get a schedule by ID
 */
export const getScheduleHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get schedule ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Schedule ID is required');
    }
    
    // Use the controller
    const controller = new ScheduleController();
    
    try {
      const result = await controller.getSchedule(id);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Schedule not found") {
        return notFoundResponse('Schedule not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting schedule:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Create a new schedule
 */
export const createScheduleHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
    const controller = new ScheduleController();
    
    try {
      const result = await controller.createSchedule(body);
      return createdResponse(result);
    } catch (error: any) {
      if (error.message.includes('required') || 
          error.message.includes('not found') || 
          error.message.includes('must be a non-empty array')) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating schedule:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Update a schedule
 */
export const updateScheduleHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get schedule ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Schedule ID is required');
    }
    
    // Parse request body
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }
    
    const body = JSON.parse(event.body);
    
    // Use the controller
    const controller = new ScheduleController();
    
    try {
      const result = await controller.updateSchedule(id, body);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Schedule not found") {
        return notFoundResponse('Schedule not found');
      }
      if (error.message.includes('required') || 
          error.message.includes('not found') || 
          error.message.includes('must be a non-empty array')) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating schedule:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Delete a schedule
 */
export const deleteScheduleHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get schedule ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Schedule ID is required');
    }
    
    // Use the controller
    const controller = new ScheduleController();
    
    try {
      await controller.deleteSchedule(id);
      return noContentResponse();
    } catch (error: any) {
      if (error.message === "Schedule not found") {
        return notFoundResponse('Schedule not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 