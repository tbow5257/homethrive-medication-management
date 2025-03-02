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
// Import shared types
import { Medication, ApiResponse } from '@medication-management/shared-types';

/**
 * Get all medications
 */
export const getMedicationsHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get query parameters
    const { careRecipientId } = event.queryStringParameters || {};
    
    // Build query
    const query: any = {
      where: {
        isActive: true
      },
      include: {
        careRecipient: true
      }
    };
    
    // Filter by care recipient if provided
    if (careRecipientId) {
      query.where.careRecipientId = careRecipientId;
    }
    
    // Get medications
    const medications = await prisma.medication.findMany(query);
    
    return successResponse(medications);
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
    const prisma = getPrismaClient();
    
    // Get medication ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    // Get medication
    const medication = await prisma.medication.findUnique({
      where: { id },
      include: {
        careRecipient: true,
        schedules: true
      }
    });
    
    if (!medication) {
      return notFoundResponse('Medication not found');
    }
    
    return successResponse(medication);
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
    const prisma = getPrismaClient();
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { name, dosage, instructions, careRecipientId } = body;
    
    // Validate required fields
    if (!name || !dosage || !instructions || !careRecipientId) {
      return badRequestResponse('Name, dosage, instructions, and care recipient ID are required');
    }
    
    // Check if care recipient exists
    const careRecipient = await prisma.careRecipient.findUnique({
      where: { id: careRecipientId }
    });
    
    if (!careRecipient) {
      return badRequestResponse('Care recipient not found');
    }
    
    // Create medication
    const medication = await prisma.medication.create({
      data: {
        name,
        dosage,
        instructions,
        careRecipientId
      },
      include: {
        careRecipient: true
      }
    });
    
    return createdResponse(medication);
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
    const prisma = getPrismaClient();
    
    // Get medication ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { name, dosage, instructions, isActive, careRecipientId } = body;
    
    // Check if medication exists
    const existingMedication = await prisma.medication.findUnique({
      where: { id }
    });
    
    if (!existingMedication) {
      return notFoundResponse('Medication not found');
    }
    
    // Update medication
    const medication = await prisma.medication.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        dosage: dosage !== undefined ? dosage : undefined,
        instructions: instructions !== undefined ? instructions : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        careRecipientId: careRecipientId !== undefined ? careRecipientId : undefined
      },
      include: {
        careRecipient: true
      }
    });
    
    return successResponse(medication);
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
    const prisma = getPrismaClient();
    
    // Get medication ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    // Check if medication exists
    const existingMedication = await prisma.medication.findUnique({
      where: { id }
    });
    
    if (!existingMedication) {
      return notFoundResponse('Medication not found');
    }
    
    // Delete medication
    await prisma.medication.delete({
      where: { id }
    });
    
    return noContentResponse();
  } catch (error) {
    console.error('Error deleting medication:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 