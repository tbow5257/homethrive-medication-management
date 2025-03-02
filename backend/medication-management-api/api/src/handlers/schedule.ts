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
import { Schedule } from '@prisma/client';
import { ApiResponse } from '../types/api';

/**
 * Get all schedules
 */
export const getSchedulesHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prisma = getPrismaClient();
    
    // Get query parameters
    const { medicationId } = event.queryStringParameters || {};
    
    // Build query
    const query: any = {
      where: {
        isActive: true
      },
      include: {
        medication: true
      }
    };
    
    // Filter by medication if provided
    if (medicationId) {
      query.where.medicationId = medicationId;
    }
    
    // Get schedules
    const schedules = await prisma.schedule.findMany(query);
    
    return successResponse(schedules);
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
    const prisma = getPrismaClient();
    
    // Get schedule ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Schedule ID is required');
    }
    
    // Get schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        medication: true
      }
    });
    
    if (!schedule) {
      return notFoundResponse('Schedule not found');
    }
    
    return successResponse(schedule);
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
    const prisma = getPrismaClient();
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { time, daysOfWeek, medicationId } = body;
    
    // Validate required fields
    if (!time || !daysOfWeek || !medicationId) {
      return badRequestResponse('Time, days of week, and medication ID are required');
    }
    
    // Validate days of week
    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return badRequestResponse('Days of week must be a non-empty array');
    }
    
    // Check if medication exists
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    });
    
    if (!medication) {
      return badRequestResponse('Medication not found');
    }
    
    // Create schedule
    const schedule = await prisma.schedule.create({
      data: {
        time,
        daysOfWeek,
        medicationId
      },
      include: {
        medication: true
      }
    });
    
    return createdResponse(schedule);
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
    const prisma = getPrismaClient();
    
    // Get schedule ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Schedule ID is required');
    }
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { time, daysOfWeek, isActive, medicationId } = body;
    
    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id }
    });
    
    if (!existingSchedule) {
      return notFoundResponse('Schedule not found');
    }
    
    // Validate days of week if provided
    if (daysOfWeek !== undefined && (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0)) {
      return badRequestResponse('Days of week must be a non-empty array');
    }
    
    // Check if medication exists if provided
    if (medicationId !== undefined) {
      const medication = await prisma.medication.findUnique({
        where: { id: medicationId }
      });
      
      if (!medication) {
        return badRequestResponse('Medication not found');
      }
    }
    
    // Update schedule
    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        time: time !== undefined ? time : undefined,
        daysOfWeek: daysOfWeek !== undefined ? daysOfWeek : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        medicationId: medicationId !== undefined ? medicationId : undefined
      },
      include: {
        medication: true
      }
    });
    
    return successResponse(schedule);
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
    const prisma = getPrismaClient();
    
    // Get schedule ID from path parameters
    const { id } = event.pathParameters || {};
    
    if (!id) {
      return badRequestResponse('Schedule ID is required');
    }
    
    // Check if schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
      where: { id }
    });
    
    if (!existingSchedule) {
      return notFoundResponse('Schedule not found');
    }
    
    // Instead of deleting, mark as inactive
    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        isActive: false
      }
    });
    
    return noContentResponse();
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return serverErrorResponse();
  } finally {
    await disconnectPrisma();
  }
}; 