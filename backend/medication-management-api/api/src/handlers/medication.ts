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
import { Medication } from '@prisma/client';
import { ApiResponse } from '../types/api';
import { MedicationController } from '../controllers/MedicationController';
import { authenticate } from '../utils/auth';

/**
 * Get all medications
 */
export const getMedicationsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get query parameters
    const { careRecipientId } = event.queryStringParameters || {};
    
    // Use the controller
    const controller = new MedicationController();
    const result = await controller.getMedications(careRecipientId);
    
    return successResponse(result);
  } catch (error) {
    console.error('Error getting medications:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get a medication by ID
 */
export const getMedicationHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get medication ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    // Use the controller
    const controller = new MedicationController();
    
    try {
      const result = await controller.getMedication(id);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Medication not found") {
        return notFoundResponse('Medication not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting medication:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Create a new medication
 */
export const createMedicationHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
    const controller = new MedicationController();
    
    try {
      const result = await controller.createMedication(body);
      return createdResponse(result);
    } catch (error: any) {
      if (error.message.includes('required') || error.message.includes('not found')) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating medication:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Update a medication
 */
export const updateMedicationHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get medication ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    // Parse request body
    if (!event.body) {
      return badRequestResponse('Request body is required');
    }
    
    const body = JSON.parse(event.body);
    
    // Use the controller
    const controller = new MedicationController();
    
    try {
      const result = await controller.updateMedication(id, body);
      return successResponse(result);
    } catch (error: any) {
      if (error.message === "Medication not found") {
        return notFoundResponse('Medication not found');
      }
      if (error.message.includes('required') || error.message.includes('not found')) {
        return badRequestResponse(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating medication:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Delete a medication
 */
export const deleteMedicationHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Authenticate user
    const user = authenticate(event);
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Get medication ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    // Use the controller
    const controller = new MedicationController();
    
    try {
      await controller.deleteMedication(id);
      return noContentResponse();
    } catch (error: any) {
      if (error.message === "Medication not found") {
        return notFoundResponse('Medication not found');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting medication:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 