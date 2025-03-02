import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { 
  successResponse, 
  createdResponse, 
  notFoundResponse, 
  badRequestResponse, 
  serverErrorResponse,
  noContentResponse
} from '../utils/response';
import { getPrismaClient, disconnectPrisma } from '../utils/prisma';

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
      where: {},
      include: {
        careRecipient: true,
        schedules: true
      }
    };
    
    // Filter by care recipient if provided
    if (careRecipientId) {
      query.where.careRecipientId = careRecipientId;
    }
    
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
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    const medication = await prisma.medication.findUnique({
      where: { id },
      include: {
        careRecipient: true,
        schedules: true,
        doses: {
          orderBy: {
            scheduledFor: 'desc'
          },
          take: 10
        }
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
    const { name, dosage, instructions, careRecipientId, schedules } = body;
    
    // Validate required fields
    if (!name || !dosage || !instructions || !careRecipientId) {
      return badRequestResponse('Name, dosage, instructions, and careRecipientId are required');
    }
    
    // Create medication with schedules if provided
    const medication = await prisma.medication.create({
      data: {
        name,
        dosage,
        instructions,
        careRecipientId,
        schedules: schedules ? {
          create: schedules
        } : undefined
      },
      include: {
        careRecipient: true,
        schedules: true
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
    const id = event.pathParameters?.id;
    
    if (!id) {
      return badRequestResponse('Medication ID is required');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { name, dosage, instructions, isActive } = body;
    
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
        name,
        dosage,
        instructions,
        isActive
      },
      include: {
        careRecipient: true,
        schedules: true
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
    const id = event.pathParameters?.id;
    
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
    
    // Delete medication (this will cascade delete schedules and doses due to Prisma relations)
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