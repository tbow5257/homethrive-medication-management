import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  badRequestResponse, 
  notFoundResponse, 
  serverErrorResponse,
  createdResponse,
  noContentResponse
} from '../utils/response';
import { getPrismaClient, disconnectPrisma } from '../utils/prisma';
// Import Prisma types directly
import { CareRecipient } from '@prisma/client';
import { ApiResponse } from '../types/api';

/**
 * Get all care recipients
 */
export const getCareRecipientsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Build query
    const query: any = {
      where: {
        isActive: true
      },
      include: {
        medications: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            name: true,
            dosage: true
          }
        }
      }
    };
    
    // Get care recipients
    const careRecipients = await prisma.careRecipient.findMany(query);
    
    return successResponse(careRecipients);
  } catch (error) {
    console.error('Error getting care recipients:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Get a care recipient by ID
 */
export const getCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get care recipient ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Care recipient ID is required');
    }
    
    // Get care recipient
    const careRecipient = await prisma.careRecipient.findUnique({
      where: { id },
      include: {
        medications: {
          where: {
            isActive: true
          }
        }
      }
    });
    
    if (!careRecipient) {
      return notFoundResponse('Care recipient not found');
    }
    
    return successResponse(careRecipient);
  } catch (error) {
    console.error('Error getting care recipient:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Create a new care recipient
 */
export const createCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { firstName, lastName, dateOfBirth } = body;
    
    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth) {
      return badRequestResponse('First name, last name, and date of birth are required');
    }
    
    // Create care recipient
    const careRecipient = await prisma.careRecipient.create({
      data: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth)
      }
    });
    
    return createdResponse(careRecipient);
  } catch (error) {
    console.error('Error creating care recipient:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Update a care recipient
 */
export const updateCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get care recipient ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Care recipient ID is required');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { firstName, lastName, dateOfBirth, isActive } = body;
    
    // Check if care recipient exists
    const existingCareRecipient = await prisma.careRecipient.findUnique({
      where: { id }
    });
    
    if (!existingCareRecipient) {
      return notFoundResponse('Care recipient not found');
    }
    
    // Update care recipient
    const careRecipient = await prisma.careRecipient.update({
      where: { id },
      data: {
        firstName: firstName !== undefined ? firstName : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        dateOfBirth: dateOfBirth !== undefined ? new Date(dateOfBirth) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    
    return successResponse(careRecipient);
  } catch (error) {
    console.error('Error updating care recipient:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
};

/**
 * Delete a care recipient
 */
export const deleteCareRecipientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get care recipient ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Care recipient ID is required');
    }
    
    // Check if care recipient exists
    const existingCareRecipient = await prisma.careRecipient.findUnique({
      where: { id }
    });
    
    if (!existingCareRecipient) {
      return notFoundResponse('Care recipient not found');
    }
    
    // Instead of deleting, mark as inactive
    const careRecipient = await prisma.careRecipient.update({
      where: { id },
      data: {
        isActive: false
      }
    });
    
    return noContentResponse();
  } catch (error) {
    console.error('Error deleting care recipient:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 